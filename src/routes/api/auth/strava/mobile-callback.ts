import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { db } from "~/lib/db";
import { getSession, updateSessionTokens } from "~/utils/session";
import { stravaClientId, stravaClientSecret } from "~/utils/strava";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";

// Debug function to log important information
function debugLog(title: string, data: Record<string, any>) {
  console.log(`[DEBUG] === ${title} ===`);
  for (const [key, value] of Object.entries(data)) {
    console.log(`[DEBUG] ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
  }
  console.log(`[DEBUG] === END ${title} ===`);
}

const requestSchema = z.object({
  code: z.string(),
  state: z.string(),
});

const profileSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  id: z.number(),
  profile: z.string(),
  email: z.string().optional(),
});

// Direct token exchange with Strava API
async function exchangeCodeForToken(code: string) {
  debugLog("Direct Token Exchange", {
    code: code.substring(0, 5) + "..." + code.substring(code.length - 5),
    clientIdPresent: !!stravaClientId,
    clientSecretLength: stravaClientSecret ? stravaClientSecret.length : 0
  });
  
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: stravaClientId,
      client_secret: stravaClientSecret,
      code,
      grant_type: 'authorization_code'
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    debugLog("Strava Token Error Response", {
      status: response.status,
      errorText
    });
    throw new Error(`Failed to exchange token: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  debugLog("Direct Token Exchange Success", {
    responseKeys: Object.keys(data),
    accessTokenPrefix: data.access_token ? data.access_token.substring(0, 5) + "..." : "missing",
    refreshTokenPrefix: data.refresh_token ? data.refresh_token.substring(0, 5) + "..." : "missing",
    expiresAt: data.expires_at ? new Date(data.expires_at * 1000).toISOString() : "unknown"
  });
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at * 1000 // Convert to milliseconds
  };
}

// Add GET handler to handle redirect from Strava OAuth flow
export async function GET(event: APIEvent) {
  debugLog("Mobile Callback Received", {
    url: event.request.url,
    method: event.request.method,
    headers: Object.fromEntries(event.request.headers.entries()),
    timestamp: new Date().toISOString()
  });
  
  try {
    // Get code and state from URL query parameters
    const url = new URL(event.request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const scope = url.searchParams.get("scope");
    const client_type = url.searchParams.get("client_type") || "mobile";
    const session_id = url.searchParams.get("session_id") || state;
    
    debugLog("OAuth Callback Parameters", {
      code: code ? "present" : "missing",
      codeLength: code?.length,
      state,
      session_id,
      scope,
      client_type
    });
    
    if (!code) {
      return renderErrorPage(event, "No authorization code received");
    }
    
    // Get the session
    const session = await getSession();
    const { state: storedState, authRequestData } = session.data;
    
    debugLog("Session Data", {
      storedState: storedState || "none",
      authRequestData: JSON.stringify(authRequestData || {}),
      sessionId: session.id
    });
    
    // For mobile flow, we'll make state validation optional if running in development
    if (process.env.NODE_ENV !== "development") {
      if (!storedState || state !== storedState) {
        debugLog("State Validation Failed", {
          receivedState: state,
          storedState: storedState || "none"
        });
        
        return renderErrorPage(event, "Invalid state parameter - Security verification failed");
      }
    }
    
    try {
      debugLog("Token Exchange - Starting", {
        code: code.substring(0, 5) + "..." + code.substring(code.length - 5),
      });
      
      // Use direct token exchange
      const { accessToken, refreshToken, expiresAt } = await exchangeCodeForToken(code);
      
      debugLog("Token Exchange - Success", {
        accessTokenPrefix: accessToken.substring(0, 5) + "...",
        refreshTokenPrefix: refreshToken.substring(0, 5) + "...",
        expiresAt: new Date(expiresAt).toISOString()
      });
      
      // Update the session with the access and refresh tokens
      await updateSessionTokens(accessToken, refreshToken);
      
      // Store token data with session_id if provided - FIX: Store in authRequestData
      if (session_id) {
        await session.update({
          authRequestData: {
            ...(session.data.authRequestData || {}),
            session_id: session_id
          }
        });
        debugLog("Associated tokens with session_id", { session_id });
      }

      debugLog("Session Updated with Tokens", {
        sessionId: session.id
      });
      
      const response = await fetch("https://www.strava.com/api/v3/athlete", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      debugLog("Strava API User Profile", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        debugLog("Strava API Error", {
          status: response.status,
          errorText
        });
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }
      
      const user = await response.json();
      debugLog("User Profile Data", {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        hasProfile: !!user.profile
      });
      
      // Upsert the user to the database
      await db.user.upsert({
        where: { stravaId: user.id },
        update: {
          firstName: user.firstname,
          lastName: user.lastname,
          imageUrl: user.profile,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        create: {
          firstName: user.firstname,
          lastName: user.lastname,
          stravaId: user.id,
          password: "",
          email: user.email || "",
          imageUrl: user.profile,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      });
      
      // Update the session
      await session.update({
        state: undefined,
        stravaId: user.id,
        // Make sure we don't overwrite the authRequestData
        authRequestData: {
          ...(session.data.authRequestData || {}),
          stravaId: user.id
        }
      });
      
      // Create a complete token data object
      const tokenData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Math.floor(expiresAt / 1000),
        user: {
          id: user.id,
          firstName: user.firstname,
          lastName: user.lastname,
          profile: user.profile,
        },
        session_id: session_id
      };
      
      // Return success HTML page with the tokenData embedded
      return renderSuccessPage(event, tokenData);
    } catch (tokenError) {
      debugLog("Token Exchange Error", {
        error: tokenError instanceof Error ? tokenError.message : String(tokenError),
        stack: tokenError instanceof Error ? tokenError.stack : "No stack trace"
      });
      
      return renderErrorPage(event, tokenError instanceof Error ? tokenError.message : String(tokenError));
    }
  } catch (error) {
    debugLog("Mobile Callback Error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    
    return renderErrorPage(event, "Authentication process failed");
  }
}

// Helper function for success page
function renderSuccessPage(event: APIEvent, tokenData: any) {
  const htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Complete</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; background: #f7f7f7; }
        .card { max-width: 500px; margin: 0 auto; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #2ecc71; }
        .spinner { display: inline-block; width: 30px; height: 30px; border: 3px solid rgba(0,0,0,0.1); border-radius: 50%; border-top-color: #2ecc71; animation: spin 1s ease-in-out infinite; margin-right: 10px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 class="success">Authentication Successful!</h2>
        <p><span class="spinner"></span> Returning to application...</p>
      </div>
      
      <script>
        // Store authentication data where the app can find it
        try {
          const authData = ${JSON.stringify(tokenData)};
          
          // Store in both localStorage and sessionStorage for redundancy
          localStorage.setItem('strava_auth_data', JSON.stringify(authData));
          sessionStorage.setItem('strava_auth_data', JSON.stringify(authData));
          
          console.log('Auth data saved to browser storage');
          
          // Try to communicate directly with opener window if available
          if (window.opener) {
            window.opener.postMessage({
              type: 'strava-auth-complete',
              success: true,
              authData: authData
            }, '*');
            
            console.log('Message posted to opener window');
          }
          
          // For React Native WebView
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'strava-auth-complete',
              success: true,
              authData: authData
            }));
            console.log('Message sent to React Native WebView');
          }
          
          // Close window or redirect
          setTimeout(function() {
            if (window.opener) {
              window.close();
            } else {
              // If we can't close (browser restriction), redirect to app
              window.location.href = "/";
            }
          }, 1500);
        } catch(e) {
          console.error('Error in auth callback processing:', e);
        }
      </script>
    </body>
    </html>
  `;
  
  const response = new Response(htmlResponse, {
    status: 200,
    headers: { "Content-Type": "text/html" }
  });
  
  return applyCors(event, response, { credentials: true });
}

// Helper function for error pages
function renderErrorPage(event: APIEvent, errorMessage: string) {
  const htmlResponse = `
    <html>
      <head>
        <title>Authentication Failed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: sans-serif; text-align: center; padding: 20px; background: #f7f7f7; }
          .card { max-width: 500px; margin: 0 auto; padding: 30px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2 class="error">Authentication Failed</h2>
          <p>${errorMessage}</p>
          <button onclick="window.close()">Close</button>
        </div>
        <script>
          // For React Native WebView
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'strava-auth-complete',
              success: false,
              error: "${errorMessage.replace(/"/g, '\\"')}"
            }));
          }
          
          // For window opener
          if (window.opener) {
            window.opener.postMessage({
              type: 'strava-auth-complete',
              success: false,
              error: "${errorMessage.replace(/"/g, '\\"')}"
            }, '*');
            
            setTimeout(() => window.close(), 5000);
          }
        </script>
      </body>
    </html>
  `;
  
  const response = new Response(htmlResponse, {
    status: 400,
    headers: { "Content-Type": "text/html" }
  });
  
  return applyCors(event, response, { credentials: true });
}

export async function POST(event: APIEvent) {
  debugLog("Mobile Callback POST Request", {
    url: event.request.url,
    method: event.request.method,
    headers: Object.fromEntries(event.request.headers.entries())
  });
  
  try {
    // Parse and validate the request body
    const body = await event.request.json();
    debugLog("Request Body", { body });
    
    // Verify state from session for CSRF protection
    const session = await getSession();
    const { state: storedState } = session.data;
    
    debugLog("State Validation", {
      receivedState: body.state,
      storedState: storedState || "none",
      matches: body.state === storedState,
      sessionId: session.id,
      sessionData: JSON.stringify(session.data)
    });
    
    // Check if cookies are being set correctly
    debugLog("Cookie Information", {
      cookieHeader: event.request.headers.get("cookie"),
      sessionCookieName: "session", // adjust if your session cookie name is different
    });
    
    // For mobile flow, we'll make state validation optional if running in development
    if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG] Development mode: bypassing strict state validation");
    } else {
      if (!storedState || body.state !== storedState) {
        debugLog("State Validation Failed", {
          receivedState: body.state,
          storedState: storedState || "none"
        });
        
        const response = new Response(
          JSON.stringify({ error: "Invalid state parameter", received: body.state, expected: storedState || "none" }), 
          { status: 400, headers: { "Content-Type": "application/json" }}
        );
        return applyCors(event, response);
      }
    }
    
    try {
      debugLog("Token Exchange - Starting", {
        code: body.code.substring(0, 5) + "..." + body.code.substring(body.code.length - 5),
      });
      
      // Use direct token exchange instead of Arctic
      const { accessToken, refreshToken, expiresAt } = await exchangeCodeForToken(body.code);
      
      debugLog("Token Exchange - Success", {
        accessTokenPrefix: accessToken.substring(0, 5) + "...",
        refreshTokenPrefix: refreshToken.substring(0, 5) + "...",
        expiresAt: new Date(expiresAt).toISOString()
      });
      
      // Update the session with the access and refresh tokens
      await updateSessionTokens(accessToken, refreshToken);

      debugLog("Session Updated with Tokens", {
        sessionId: session.id
      });
      
      const response = await fetch("https://www.strava.com/api/v3/athlete", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      debugLog("Strava API User Profile", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        debugLog("Strava API Error", {
          status: response.status,
          errorText
        });
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }
      
      const user = await response.json();
      debugLog("User Profile Data", {
        id: user.id,
        name: `${user.firstname} ${user.lastname}`,
        hasProfile: !!user.profile
      });
      
      // Upsert the user to the database
      await db.user.upsert({
        where: { stravaId: user.id },
        update: {
          firstName: user.firstname,
          lastName: user.lastname,
          imageUrl: user.profile,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        create: {
          firstName: user.firstname,
          lastName: user.lastname,
          stravaId: user.id,
          password: "",
          email: user.email || "",
          imageUrl: user.profile,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      });
      
      // Update the session
      await session.update({
        state: undefined,
        stravaId: user.id,
      });
      
      // Create a complete token data object as specified
      const tokenData = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: Math.floor(expiresAt / 1000),
        user: {
          id: user.id,
          firstName: user.firstname,
          lastName: user.lastname,
          profile: user.profile,
        },
        session_id: session.id
      };
      
      // Return success HTML page with the tokenData embedded
      return renderSuccessPage(event, tokenData);
    } catch (tokenError) {
      debugLog("Token Exchange Error", {
        error: tokenError instanceof Error ? tokenError.message : String(tokenError),
        stack: tokenError instanceof Error ? tokenError.stack : "No stack trace"
      });
      
      return renderErrorPage(event, tokenError instanceof Error ? tokenError.message : String(tokenError));
    }
  } catch (error) {
    debugLog("POST Request Error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    
    const errorResponse = new Response(
      JSON.stringify({ error: "Authentication failed" }), 
      { status: 400, headers: { "Content-Type": "application/json" }}
    );
    return applyCors(event, errorResponse);
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(event: APIEvent) {
  debugLog("CORS Preflight Request", {
    url: event.request.url,
    method: event.request.method,
    headers: Object.fromEntries(event.request.headers.entries())
  });
  
  return handleCorsPreflightRequest(event);
}
