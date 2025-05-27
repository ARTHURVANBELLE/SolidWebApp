import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { db } from "~/lib/db";
import { getSession, updateSessionTokens } from "~/utils/session";
import { strava } from "~/utils/strava";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";

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

export async function POST(event: APIEvent) {
  try {
    // Parse and validate the request body
    const body = await event.request.json();
    const { code, state } = requestSchema.parse(body);
    
    // Verify state from session for CSRF protection
    const session = await getSession();
    const { state: storedState } = session.data;
    
    if (!storedState || state !== storedState) {
      const response = new Response(
        JSON.stringify({ error: "Invalid state parameter" }), 
        { status: 400, headers: { "Content-Type": "application/json" }}
      );
      return applyCors(event, response);
    }
    
    // Get token using Arctic instead of Strava OAuth2
    const arctic = await strava.validateAuthorizationCode(code);
    const accessToken = arctic.accessToken;
    const refreshToken = arctic.refreshToken;
    
    // Update the session with the access and refresh tokens
    await updateSessionTokens(accessToken(), refreshToken());
    
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${accessToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }
    
    const user = await response.json();
    const userInfo = profileSchema.parse(user);
    
    // Upsert the user to the database
    await db.user.upsert({
      where: { stravaId: userInfo.id },
      update: {
        firstName: userInfo.firstname,
        lastName: userInfo.lastname,
        imageUrl: userInfo.profile,
        accessToken: accessToken(),
        refreshToken: refreshToken(),
      },
      create: {
        firstName: userInfo.firstname,
        lastName: userInfo.lastname,
        stravaId: userInfo.id,
        password: "",
        email: userInfo.email || "",
        imageUrl: userInfo.profile,
        accessToken: accessToken(),
        refreshToken: refreshToken(),
      },
    });
    
    // Update the session
    await session.update({
      state: undefined,
      stravaId: userInfo.id,
    });
    
    const responseBody = JSON.stringify({
      access_token: accessToken(),
      refresh_token: refreshToken(),
      user: {
        id: userInfo.id,
        firstName: userInfo.firstname,
        lastName: userInfo.lastname,
        profile: userInfo.profile,
      }
    });
    
    const successResponse = new Response(responseBody, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
    return applyCors(event, successResponse);
  } catch (error) {
    console.error("Error processing Strava callback:", error);
    const errorResponse = new Response(
      JSON.stringify({ error: "Authentication failed" }), 
      { status: 400, headers: { "Content-Type": "application/json" }}
    );
    return applyCors(event, errorResponse);
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}
