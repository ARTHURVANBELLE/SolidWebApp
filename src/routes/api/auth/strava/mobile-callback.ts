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
    
    debugLog("OAuth Callback Parameters", {
      code: code ? "present" : "missing",
      codeLength: code?.length,
      state,
      scope
    });
    
    if (!code || !state) {
      debugLog("Missing Parameters", {
        missingCode: !code,
        missingState: !state
      });
      
      const response = new Response(
        JSON.stringify({ error: "Missing code or state parameter" }), 
        { status: 400, headers: { "Content-Type": "application/json" }}
      );
      return applyCors(event, response);
    }
    
    // Verify state from session for CSRF protection
    const session = await getSession();
    const { state: storedState } = session.data;
    
    debugLog("State Validation", {
      receivedState: state,
      storedState: storedState || "none",
      matches: state === storedState,
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
      if (!storedState || state !== storedState) {
        debugLog("State Validation Failed", {
          receivedState: state,
          storedState: storedState || "none"
        });
        
        const response = new Response(
          JSON.stringify({ error: "Invalid state parameter", received: state, expected: storedState || "none" }), 
          { status: 400, headers: { "Content-Type": "application/json" }}
        );
        return applyCors(event, response);
      }
    }
    
    try {
      debugLog("Token Exchange - Starting", {
        code: code.substring(0, 5) + "..." + code.substring(code.length - 5),
      });
      
      // Use direct token exchange instead of Arctic
      const { accessToken, refreshToken, expiresAt } = await exchangeCodeForToken(code);
      
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
      
      const responseBody = JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          firstName: user.firstname,
          lastName: user.lastname,
          profile: user.profile,
        }
      });
      
      const successResponse = new Response(responseBody, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
      
      return applyCors(event, successResponse);
    } catch (tokenError) {
      debugLog("Token Exchange Error", {
        error: tokenError instanceof Error ? tokenError.message : String(tokenError),
        stack: tokenError instanceof Error ? tokenError.stack : "No stack trace"
      });
      
      const errorResponse = new Response(
        JSON.stringify({ error: "Authentication failed" }), 
        { status: 400, headers: { "Content-Type": "application/json" }}
      );
      return applyCors(event, errorResponse);
    }
  } catch (error) {
    debugLog("Mobile Callback Error", {
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
      
      const responseBody = JSON.stringify({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user.id,
          firstName: user.firstname,
          lastName: user.lastname,
          profile: user.profile,
        }
      });
      
      const successResponse = new Response(responseBody, {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
      
      return applyCors(event, successResponse);
    } catch (tokenError) {
      debugLog("Token Exchange Error", {
        error: tokenError instanceof Error ? tokenError.message : String(tokenError),
        stack: tokenError instanceof Error ? tokenError.stack : "No stack trace"
      });
      
      const errorResponse = new Response(
        JSON.stringify({ error: "Authentication failed" }), 
        { status: 400, headers: { "Content-Type": "application/json" }}
      );
      return applyCors(event, errorResponse);
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
