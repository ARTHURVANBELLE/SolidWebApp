import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { getSession, updateSessionTokens } from "~/utils/session";
import { stravaClientId, stravaClientSecret } from "~/utils/strava";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";
import { upsertUser, UserInterface } from "~/lib/user";
import { generateAccessToken } from "~/utils/jwt";
import { addToken } from "~/lib/token";

// Simplified logging for important events
function log(title: string, message?: any) {
  console.log(`[Strava Auth] ${title}`, message ? message : '');
}

// Enhanced debug logging
function debug(context: string, data: any) {
  console.log(`[Strava Auth Debug] ${context}:`, 
    typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
}

// Even more detailed debugging for critical operations
function debugCritical(context: string, data: any) {
  console.log(`[Strava Auth Critical] ${context}:`, 
    typeof data === 'object' ? 
      JSON.stringify(data, (key, value) => 
        typeof value === 'function' ? '[Function]' : value, 2) 
      : data);
}

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
    debug('Exchanging code for token', { code: code.substring(0, 5) + '...' });
    
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
      log("Token exchange failed", { status: response.status, error: errorText });
      throw new Error(
        `Failed to exchange token: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    debug('Token exchange response structure', {
      keys_present: Object.keys(data),
      has_access_token: !!data.access_token
    });
    
    return {
      accessToken: data.access_token,
    };
  } catch (error) {
    debug('Token exchange error details', { 
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  }
}

// Handle redirect from Strava OAuth flow
export async function GET(event: APIEvent) {
  // Set CORS headers for preflight requests
  if (event.request.method === "OPTIONS") {
    return handleCorsPreflightRequest(event);
  }
  
  try {
    // Get code and state from URL query parameters
    const url = new URL(event.request.url);
    debug('Request URL', { url: event.request.url });
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const session_id = url.searchParams.get("session_id") || state;

    debug('Auth parameters', { 
      code: code ? `${code.substring(0, 5)}...` : null, 
      state, 
      session_id 
    });

    if (!code) {
      return renderErrorPage(event, "No authorization code received");
    }

    // Get the session
    const session = await getSession();
    const { state: storedState, authRequestData } = session.data;
    debug('Session data', { 
      storedState, 
      authRequestData: authRequestData || 'none' 
    });

    // Validate state parameter for security (optional in development)
    if (process.env.NODE_ENV !== "development") {
      if (!storedState || state !== storedState) {
        return renderErrorPage(event, "Invalid state parameter - Security verification failed");
      }
    }

    // Exchange code for access token only (no refresh token handling)
    const { accessToken } = await exchangeCodeForToken(code);
    debug('Access token received', { tokenPresent: !!accessToken });
    
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
    debug('Fetching user profile', { accessToken: `${accessToken.substring(0, 5)}...` });
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      debug('Profile fetch error', { status: response.status, body: errorText });
      throw new Error(
        `Failed to fetch user profile: ${response.status} ${response.statusText}`
      );
    }

    const user = await response.json();
    debug('User profile data structure', { 
      keys: Object.keys(user),
      id: user.id,
      hasFirstname: !!user.firstname,
      hasLastname: !!user.lastname
    });

    // Upsert the user to the database
    await upsertUser({
      firstName: user.firstname,
      lastName: user.lastname,
      stravaId: user.id,
      email: user.email || "",
      imageUrl: user.profile,
    });
    
    // Generate JWT for authentication
    debug('Generating JWT', { userId: user.id });
    const jwt = generateJwtForUser(user.id, user.firstname, user.lastname);
    debugCritical('JWT after generation', { 
      isString: typeof jwt === 'string',
      isEmpty: jwt === '',
      length: jwt ? jwt.length : 0,
      start: jwt ? jwt.substring(0, 10) + '...' : 'none'
    });

    // Log before token creation
    debugCritical('Before createToken', { 
      stravaId: user.id,
      hasJwt: !!jwt,
      hasAccessToken: !!accessToken
    });
    
    try {
      await addToken(
        {
          stravaId: user.id,
          jwt: jwt,
          accessToken: accessToken,
        }
      );
      debugCritical('Token created successfully', { stravaId: user.id });
    } catch (tokenError) {
      debugCritical('Token creation error', { 
        error: tokenError instanceof Error ? tokenError.message : String(tokenError),
        stack: tokenError instanceof Error ? tokenError.stack : 'No stack trace'
      });
      // Continue even if token creation fails
    }

    // Update the session
    try {
      debugCritical('Before session update', { 
        sessionExists: !!session, 
        hasUpdateMethod: !!session?.update
      });
      
      await session.update({
        state: undefined,
        stravaId: user.id,
        authRequestData: {
          ...(session.data.authRequestData || {}),
          stravaId: user.id,
        }
      });
      debugCritical('Session updated successfully', {});
    } catch (sessionError) {
      debugCritical('Session update error', { 
        error: sessionError instanceof Error ? sessionError.message : String(sessionError),
        stack: sessionError instanceof Error ? sessionError.stack : 'No stack trace' 
      });
      // Continue even if session update fails
    }

    // Create token data object with JWT and stravaId highlighted
    debugCritical('Preparing token data', { 
      hasJwt: !!jwt,
      stravaId: user.id,
      hasUserData: !!user
    });
    
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
    
    debug('Token data for response', tokenData);
    debugCritical('Before redirect response', { 
      hasTokenData: !!tokenData,
      tokenDataKeys: Object.keys(tokenData)
    });

    try {
      const response = createRedirectResponse(event, tokenData);
      debugCritical('Redirect response created successfully', {});
      return response;
    } catch (redirectError) {
      debugCritical('Redirect response creation error', { 
        error: redirectError instanceof Error ? redirectError.message : String(redirectError),
        stack: redirectError instanceof Error ? redirectError.stack : 'No stack trace'
      });
      
      // Create a simple fallback response if redirect fails
      const fallbackResponse = new Response(
        JSON.stringify({ 
          success: true,
          message: "Authentication successful but redirect failed",
          jwt: jwt,
          stravaId: user.id
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
      return applyCors(event, fallbackResponse);
    }
  } catch (error) {
    debug('Authentication error details', { 
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    log("Authentication error", error instanceof Error ? error.message : String(error));
    
    const errorResponse = new Response(
      JSON.stringify({ 
        error: "Authentication failed", 
        message: error instanceof Error ? error.message : String(error) 
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
    return applyCors(event, errorResponse);
  }
}

/**
 * Generate JWT token for the user
 */
function generateJwtForUser(userId: number, firstName: string, lastName: string): string {
  try {
    debugCritical('JWT Generation Input', { userId, firstName, lastName });
    const accessToken = generateAccessToken(userId, false);
    debugCritical('JWT Generation Result', { 
      success: true,
      tokenLength: accessToken ? accessToken.length : 0,
      tokenStart: accessToken ? accessToken.substring(0, 10) + '...' : 'none'
    });
    return accessToken;
  } catch (error) {
    debugCritical('JWT Generation Error', { 
      userId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    log("JWT generation error", error);
    return "";
  }
}

/**
 * Create a response that redirects to the mobile app with auth data
 */
function createRedirectResponse(event: APIEvent, tokenData: any) {
  try {
    debugCritical('createRedirectResponse input', { 
      hasEvent: !!event,
      hasTokenData: !!tokenData,
      tokenDataKeys: tokenData ? Object.keys(tokenData) : []
    });
    
    // Check for null/undefined tokenData
    if (!tokenData) {
      throw new Error("Token data is undefined or null");
    }
    
    // For API requests that expect JSON (mobile app fetch requests)
    const acceptHeader = event.request.headers.get('Accept');
    if (acceptHeader && acceptHeader.includes('application/json')) {
      const jsonResponse = new Response(
        JSON.stringify(tokenData),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );
      return applyCors(event, jsonResponse, { credentials: true });
    }

    // Safely stringify the token data with error handling
    let tokenDataString;
    try {
      tokenDataString = JSON.stringify(tokenData);
      debug('Stringified token data length', { length: tokenDataString.length });
    } catch (err) {
      debug('Error stringifying token data', { 
        error: err instanceof Error ? err.message : String(err) 
      });
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
        "Cache-Control": "no-store"
      }
    });
    
    return applyCors(event, response, { credentials: true });
  } catch (error) {
    debug('Redirect response error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // Return a plain error response if redirect fails
    const fallbackResponse = new Response(
      JSON.stringify({ 
        error: "Redirect failed", 
        message: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
    return applyCors(event, fallbackResponse);
  }
}

// Handle CORS preflight requests
export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}

// Simple error page renderer
function renderErrorPage(event: APIEvent, errorMessage: string) {
  log("Error", errorMessage);
  
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
    headers: { "Content-Type": "text/html" }
  });
  
  return applyCors(event, response);
}
