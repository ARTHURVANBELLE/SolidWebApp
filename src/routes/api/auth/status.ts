import { type APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";
import { getSession } from "~/utils/session";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";
import { validateAccessToken } from "~/utils/jwt";

// Debug function to log important information
function debugLog(title: string, data: Record<string, any>) {
  console.log(`[DEBUG] === ${title} ===`);
  for (const [key, value] of Object.entries(data)) {
    console.log(`[DEBUG] ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
  }
  console.log(`[DEBUG] === END ${title} ===`);
}

export async function GET(event: APIEvent) {
  debugLog("Auth Status Check", {
    url: event.request.url,
    method: event.request.method,
    headers: Object.fromEntries(event.request.headers.entries()),
    timestamp: new Date().toISOString()
  });

  try {
    // Optional: Get session_id from query parameters for specific session validation
    const url = new URL(event.request.url);
    const session_id = url.searchParams.get("session_id");
    const format = url.searchParams.get("format") || "json";
    
    // Get the current session
    const session = await getSession();
    
    debugLog("Current Session", {
      sessionId: session.id,
      sessionData: JSON.stringify(session.data),
      hasStravaId: !!session.data.stravaId,
      providedSessionId: session_id
    });
    
    // FIXED: Check for session_id in authRequestData instead of stravaSessionId
    const storedSessionId = session.data.authRequestData?.session_id;
    
    // If session_id is provided, validate it against the stored session_id
    if (session_id && storedSessionId !== session_id) {
      debugLog("Session ID Mismatch", {
        providedSessionId: session_id,
        storedSessionId: storedSessionId || "none"
      });
      
      // Return not authenticated for session_id mismatch
      return createAuthResponse(event, false, null, format, "Session ID mismatch");
    }
    
    // If no Strava ID in session, user is not authenticated
    if (!session.data.stravaId) {
      return createAuthResponse(event, false, null, format, "No authentication found");
    }
    
    // Get user data from the database
    const user = await db.user.findUnique({
      where: { stravaId: Number(session.data.stravaId) },
      select: {
        stravaId: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      }
    });
    
    // If no user found, session is invalid
    if (!user) {
      // Clear the invalid session
      await session.update({ stravaId: undefined });
      return createAuthResponse(event, false, null, format, "User not found");
    }
    
    
    // Check if we have a JWT token in the Authorization header
    const authHeader = event.request.headers.get('Authorization');
    let stravaAccessToken: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = validateAccessToken(token);
      
      if (payload) {
        debugLog("JWT Token Info", {
          userId: payload.userId,
          hasAccessToken: !!payload.accessToken
        });
        
        // Extract Strava access token if available
        stravaAccessToken = payload.accessToken;
      }
    }
    
    // Create auth data object with access token if available
    const authData = {
      isAuthenticated: true,
      user: {
        id: user.stravaId,
        firstName: user.firstName,
        lastName: user.lastName,
        profile: user.imageUrl
      },
      // Include the access token if we have it
      accessToken: stravaAccessToken,
      // FIXED: Use the correct session_id from authRequestData
      session_id: storedSessionId || session.id
    };
    
    // Return the authentication response
    return createAuthResponse(event, true, authData, format);
    
  } catch (error) {
    debugLog("Auth Status Error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    
    return createAuthResponse(event, false, null, "json", 
      `Error checking auth status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create an appropriate authentication response based on format
 */
function createAuthResponse(
  event: APIEvent, 
  isAuthenticated: boolean, 
  authData: any, 
  format: string,
  message?: string
) {
  // For unauthenticated responses
  if (!isAuthenticated) {
    const responseData = { 
      isAuthenticated: false, 
      message: message || "Not authenticated"
    };
    
    if (format === "html") {
      const htmlResponse = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Authentication Status</title>
          <script>
            const authData = ${JSON.stringify(responseData)};
            
            // For React Native WebView
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "AUTH_STATUS",
                data: authData
              }));
            }
            
            // For Expo WebBrowser
            if (window.opener) {
              window.opener.postMessage({
                type: "AUTH_STATUS",
                data: authData
              }, "*");
            }
            
            // Try to close the window
            try {
              window.close();
            } catch (e) {
              console.log("Could not close window:", e);
            }
          </script>
        </head>
        <body>
          <div>
            <h2>Not Authenticated</h2>
            <p>${message || "You are not currently authenticated."}</p>
          </div>
        </body>
      </html>
      `;
      
      const htmlResponseObj = new Response(htmlResponse, {
        status: 200,
        headers: { "Content-Type": "text/html" }
      });
      return applyCors(event, htmlResponseObj, { credentials: true });
    }
    
    // Default to JSON response
    const jsonResponse = new Response(
      JSON.stringify(responseData), 
      { status: 200, headers: { "Content-Type": "application/json" }}
    );
    return applyCors(event, jsonResponse, { credentials: true });
  }
  
  // For authenticated responses
  if (format === "html") {
    const htmlResponse = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authentication Status</title>
        <script>
          const authData = ${JSON.stringify(authData)};
          
          // Try to store auth data in localStorage for potential retrieval later
          try {
            localStorage.setItem("strava_auth_data", JSON.stringify(authData));
            console.log("Auth data stored in localStorage");
          } catch (e) {
            console.error("Could not store auth data:", e);
          }
          
          // For React Native WebView
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "AUTH_STATUS",
              data: authData
            }));
          }
          
          // For Expo WebBrowser
          if (window.opener) {
            window.opener.postMessage({
              type: "AUTH_STATUS",
              data: authData
            }, "*");
          }
          
          // Try to close the window
          try {
            window.close();
          } catch (e) {
            console.log("Could not close window:", e);
          }
        </script>
      </head>
      <body>
        <div>
          <h2>Authenticated</h2>
          <p>You are authenticated as ${authData.user.firstName} ${authData.user.lastName}.</p>
        </div>
      </body>
    </html>
    `;
    
    const htmlResponseObj = new Response(htmlResponse, {
      status: 200,
      headers: { "Content-Type": "text/html" }
    });
    return applyCors(event, htmlResponseObj, { credentials: true });
  }
  
  // Default to JSON response
  const jsonResponse = new Response(
    JSON.stringify(authData), 
    { status: 200, headers: { "Content-Type": "application/json" }}
  );
  return applyCors(event, jsonResponse, { credentials: true });
}

export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event, { credentials: true });
}