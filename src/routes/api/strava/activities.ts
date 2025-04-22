import { type APIEvent } from "@solidjs/start/server";
import { getSession } from "~/utils/session";

export async function GET(event: APIEvent) {
  try {
    // Get the session directly
    const session = await getSession();
    
    // Check if tokens exist in the session
    if (!session.data?.accessToken) {
      console.error("No access token found in session", session.data);
      return new Response(JSON.stringify({ 
        error: "Not authenticated with Strava",
        session: "No access token found"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log("Session retrieved successfully, access token exists");
    
    // Fetch the last 10 activities from Strava API
    const response = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=10", {
      headers: {
        Authorization: `Bearer ${session.data.accessToken}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("Strava API error:", error);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch activities from Strava",
        details: error
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const activities = await response.json();
    console.log("Fetched activities count:", activities.length);
    
    return new Response(JSON.stringify(activities), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in activities endpoint:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
