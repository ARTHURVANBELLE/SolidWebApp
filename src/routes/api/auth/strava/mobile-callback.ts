import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { db } from "~/lib/db";
import { getSession, updateSessionTokens } from "~/utils/session";
import { stravaClientId, stravaClientSecret } from "~/utils/strava";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";
import { upsertUser, UserInterface } from "~/lib/user";
import { generateAccessToken } from "~/utils/jwt";
import { upsertToken } from "~/lib/token";

const requestSchema = z.object({
  code: z.string(),
  state: z.string(),
});

const profileSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  stravaId: z.number(),
  profile: z.string(),
  email: z.string().optional(),
});

// Direct token exchange with Strava API
async function exchangeCodeForToken(code: string) {
  try {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: stravaClientId,
        client_secret: stravaClientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to exchange token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
    };
  } catch (error) {
    throw error;
  }
}

// Handle redirect from Strava OAuth flow
export async function GET(event: APIEvent) {
  // Keep CORS handling for preflight requests
  if (event.request.method === "OPTIONS") {
    return handleCorsPreflightRequest(event);
  }

  try {
    // Get code and state from URL query parameters
    const url = new URL(event.request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const session_id = url.searchParams.get("session_id") || state;

    if (!code) {
      return renderErrorPage(event, "No authorization code received");
    }

    // Get the session
    const session = await getSession();
    const { state: storedState, authRequestData } = session.data;

    // Validate state parameter for security (optional in development)
    if (process.env.NODE_ENV !== "development") {
      if (!storedState || state !== storedState) {
        return renderErrorPage(
          event,
          "Invalid state parameter - Security verification failed"
        );
      }
    }

    // Exchange code for access token
    const { accessToken } = await exchangeCodeForToken(code);
    
    // Update the session with just the access token
    await updateSessionTokens(accessToken);

    // Store session_id if provided
    if (session_id) {
      await session.update({
        authRequestData: {
          ...(session.data.authRequestData || {}),
          session_id: session_id,
        },
      });
    }

    // Fetch user profile from Strava
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch user profile: ${response.status} ${response.statusText}`
      );
    }

    const user = await response.json();

    // Upsert the user to the database
    await upsertUser({
      firstName: user.firstname,
      lastName: user.lastname,
      stravaId: user.id,
      email: user.email || "",
      imageUrl: user.profile,
    });

    // Generate JWT for authentication with Strava access token included
    const jwt = generateJwtForUser(
      user.id,
      user.firstname,
      user.lastname,
      accessToken
    );

    // Store the token in the database if needed
    try {
      // First, ensure the user exists in the database
      const userExists = await db.user.findUnique({
        where: { stravaId: Number(user.id) }
      });
      
      if (userExists) {
        await upsertToken({ stravaId: user.id, jwt, accessToken });
      }
    } catch (tokenError) {
      // Continue even if token storage fails
    }

    // Update the session
    try {
      await session.update({
        state: undefined,
        stravaId: user.id,
        authRequestData: {
          ...(session.data.authRequestData || {}),
          stravaId: user.id,
        },
      });
    } catch (sessionError) {
      // Continue even if session update fails
    }

    // Create token data object with JWT and stravaId highlighted
    const tokenData = {
      jwt_token: jwt,
      stravaId: user.id,
      user: {
        id: user.id,
        firstName: user.firstname,
        lastName: user.lastname,
        profile: user.profile,
      },
      session_id: session_id,
    };

    // Return the redirect response - keeps CORS handling intact
    return createRedirectResponse(event, tokenData);
  } catch (error) {
    // Keep CORS handling for error responses
    const errorResponse = new Response(
      JSON.stringify({
        error: "Authentication failed",
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
    return applyCors(event, errorResponse);
  }
}

/**
 * Generate JWT token for the user
 */
function generateJwtForUser(
  userId: number,
  firstName: string,
  lastName: string,
  accessToken: string
): string {
  try {
    // Generate access token with Strava access token included
    return generateAccessToken(userId, false, accessToken);
  } catch (error) {
    return "";
  }
}

/**
 * Create a response that redirects to the mobile app with auth data
 */
function createRedirectResponse(event: APIEvent, tokenData: any) {
  try {
    // For API requests that expect JSON (mobile app fetch requests)
    const acceptHeader = event.request.headers.get("Accept");
    if (acceptHeader && acceptHeader.includes("application/json")) {
      const jsonResponse = new Response(JSON.stringify(tokenData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      });
      // Preserve CORS handling
      return applyCors(event, jsonResponse, { credentials: true });
    }

    // Safely stringify the token data with error handling
    let tokenDataString;
    try {
      tokenDataString = JSON.stringify(tokenData);
    } catch (err) {
      throw new Error(`Failed to stringify token data: ${err}`);
    }

    // For browser-based redirects (WebView within mobile app)
    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          try {
            // Store the token data in local storage
            const authData = ${tokenDataString};
            console.log("Auth data received:", Object.keys(authData));
            localStorage.setItem('strava_auth_data', JSON.stringify(authData));
            
            // Try different methods to communicate with the app
            
            // 1. Use a custom URL scheme
            window.location.href = "myapp://auth-callback?data=" + encodeURIComponent(JSON.stringify(authData));
            
            // 2. If we're in a WebView from the app, post a message
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'strava-auth-complete',
                authData: authData
              }));
            }
            
            // 3. If there's a parent window (like an opener), post to it
            if (window.opener) {
              window.opener.postMessage({
                type: 'strava-auth-complete',
                authData: authData
              }, '*');
              setTimeout(() => window.close(), 300);
            }
          } catch (err) {
            console.error("Error in auth callback:", err);
            document.body.innerHTML += '<p>Error: ' + err.message + '</p>';
          }
        </script>
      </head>
      <body>
        <p>Authentication successful. Redirecting to app...</p>
      </body>
      </html>
    `;

    const response = new Response(htmlResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store",
      },
    });

    // Preserve CORS handling
    return applyCors(event, response, { credentials: true });
  } catch (error) {
    // Preserve CORS handling for fallback response
    const fallbackResponse = new Response(
      JSON.stringify({
        error: "Redirect failed",
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
    return applyCors(event, fallbackResponse);
  }
}

// Keep CORS preflight handling
export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}

// Simple error page renderer
function renderErrorPage(event: APIEvent, errorMessage: string) {
  const htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body>
      <h3>Authentication Error</h3>
      <p>${errorMessage}</p>
    </body>
    </html>
  `;
  
  const response = new Response(htmlResponse, {
    status: 400,
    headers: { "Content-Type": "text/html" },
  });
  
  return applyCors(event, response);
}
