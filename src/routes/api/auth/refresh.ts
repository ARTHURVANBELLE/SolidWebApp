import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { db } from "~/lib/db";
import { getSession, updateSessionTokens } from "~/utils/session";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";


const requestSchema = z.object({
  refresh_token: z.string()
});

export async function POST(event: APIEvent) {
  const response = await handlePostRequest(event);
  return applyCors(event,response);
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}

async function handlePostRequest(event: APIEvent) {
  try {
    // Parse and validate the request body
    const body = await event.request.json();
    const { refresh_token } = requestSchema.parse(body);
    
    // Use the refresh token to get new tokens
    // Update this to use your actual Strava/Arctic refresh token method
    const response = await fetch('https://www.strava.com/api/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type: 'refresh_token'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }
    
    const tokens = await response.json();
    const accessToken = tokens.access_token;
    const newRefreshToken = tokens.refresh_token;
    const expiresIn = tokens.expires_in;
    
    // Update the session with the new tokens
    await updateSessionTokens(accessToken, newRefreshToken);
    
    // Get the current authenticated user
    const session = await getSession();
    const { stravaId } = session.data;
    
    if (stravaId) {
      // Update tokens in the database
      await db.user.update({
        where: { stravaId: Number(stravaId) },
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    }

    return new Response(JSON.stringify({
      access_token: accessToken,
      refresh_token: newRefreshToken,
      expires_in: expiresIn
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return new Response(JSON.stringify({ error: "Failed to refresh token" }), { status: 400 });
  }
}
