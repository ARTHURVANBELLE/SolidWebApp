import { type APIEvent } from "@solidjs/start/server";
import { getSession } from "~/utils/session";
import { createStravaAuthUrl } from "~/utils/strava";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";
import crypto from "crypto";

// Debug function to log important information
function debugLog(title: string, data: Record<string, any>) {
  console.log(`[DEBUG] === ${title} ===`);
  for (const [key, value] of Object.entries(data)) {
    console.log(`[DEBUG] ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
  }
  console.log(`[DEBUG] === END ${title} ===`);
}

export async function GET(event: APIEvent) {
  try {
    // Log incoming request details
    debugLog("Mobile Auth Request", {
      url: event.request.url,
      method: event.request.method,
      headers: Object.fromEntries(event.request.headers.entries()),
      timestamp: new Date().toISOString()
    });

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomBytes(16).toString("hex");
    
    // Store the state in the session
    const session = await getSession();
    const previousState = session.data.state;
    
    debugLog("Session Before Update", {
      sessionId: session.id,
      existingState: previousState || "none",
      newState: state,
      sessionData: session.data
    });

    await session.update({
      state: state
    });
    
    // Verify state was properly stored
    const updatedSession = await getSession();
    debugLog("Session After Update", {
      sessionId: updatedSession.id,
      verifiedState: updatedSession.data.state,
      sessionData: updatedSession.data
    });
    
    // Use the enhanced utility
    const redirectUri = `${process.env.API_URL || "http://localhost:3000"}/api/auth/strava/mobile-callback`;
    const authUrl = createStravaAuthUrl(state, redirectUri);
    
    debugLog("Auth URL Generation", {
      redirectUri,
      state,
      authUrl: authUrl.toString(),
      apiUrl: process.env.API_URL || "http://localhost:3000"
    });
    
    // Return the authorization URL and state to the client
    const responseBody = JSON.stringify({
      auth_url: authUrl.toString(),
      state: state
    });
    
    const response = new Response(responseBody, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
    return applyCors(event, response);
  } catch (error) {
    console.error("Error generating auth URL:", error);
    const errorResponse = new Response(
      JSON.stringify({ 
        error: "Failed to generate authentication URL", 
        details: error instanceof Error ? error.message : String(error) 
      }), 
      { status: 500, headers: { "Content-Type": "application/json" }}
    );
    return applyCors(event, errorResponse);
  }
}

export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}
