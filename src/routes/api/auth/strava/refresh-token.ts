import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { db } from "~/lib/db";
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

const refreshTokenSchema = z.object({
  refresh_token: z.string()
});

export async function POST(event: APIEvent) {
  debugLog("Refresh Token Request", {
    url: event.request.url,
    method: event.request.method,
    timestamp: new Date().toISOString()
  });

  try {
    const body = await event.request.json();
    const { refresh_token } = refreshTokenSchema.parse(body);
    
    debugLog("Refresh Token Parameters", {
      refreshTokenPrefix: refresh_token ? refresh_token.substring(0, 5) + "..." : "missing"
    });
    
    // Call Strava API to refresh the token
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: stravaClientId,
        client_secret: stravaClientSecret,
        refresh_token,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      debugLog("Token Refresh Error", {
        status: response.status,
        errorText
      });
      const errorResponse = new Response(
        JSON.stringify({ error: "Failed to refresh token", details: errorText }), 
        { status: response.status, headers: { "Content-Type": "application/json" }}
      );
      return applyCors(event, errorResponse);
    }
    
    const tokenData = await response.json();
    
    debugLog("Token Refresh Success", {
      responseKeys: Object.keys(tokenData),
      accessTokenPrefix: tokenData.access_token ? tokenData.access_token.substring(0, 5) + "..." : "missing",
      refreshTokenPrefix: tokenData.refresh_token ? tokenData.refresh_token.substring(0, 5) + "..." : "missing"
    });
    
    // Update the tokens in the database if the user exists
    if (tokenData.athlete && tokenData.athlete.id) {
      try {
        await db.user.update({
          where: { stravaId: tokenData.athlete.id },
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token
          }
        });
        debugLog("Database Updated", { userId: tokenData.athlete.id });
      } catch (dbError) {
        debugLog("Database Error", { error: String(dbError) });
        // Continue even if DB update fails - we still want to return the new tokens
      }
    }
    
    const successResponse = new Response(
      JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at
      }), 
      { status: 200, headers: { "Content-Type": "application/json" }}
    );
    
    return applyCors(event, successResponse);
  } catch (error) {
    debugLog("Refresh Token Error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace"
    });
    
    const errorResponse = new Response(
      JSON.stringify({ error: "Failed to refresh token" }), 
      { status: 400, headers: { "Content-Type": "application/json" }}
    );
    
    return applyCors(event, errorResponse);
  }
}

export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}
