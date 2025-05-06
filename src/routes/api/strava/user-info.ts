import { type APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const accessToken = event.request.headers.get("Authorization")?.split("Bearer ")[1];
    
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Authorization token required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Get the user's info from Strava
    const response = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: "Failed to fetch user from Strava",
        status: response.status 
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const stravaUser = await response.json();
    
    // Get the user from our database
    const dbUser = await db.user.findUnique({
      where: { stravaId: stravaUser.id }
    });
    
    return new Response(JSON.stringify({
      strava_user: stravaUser,
      db_user: dbUser
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch user information",
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
