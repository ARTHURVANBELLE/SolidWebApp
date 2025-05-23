import { type APIEvent } from "@solidjs/start/server";
import { getSession } from "~/utils/session";

export async function GET(event: APIEvent) {
  try {
    // Best practice: Get access token from Authorization header only
    let accessToken = event.request.headers.get("Authorization");
    
    // Remove Bearer prefix if present
    if (accessToken && accessToken.startsWith("Bearer ")) {
      accessToken = accessToken.substring(7);
    } else {
      // For backward compatibility, check query parameters (less secure)
      // TODO: Deprecate this method in the future
      const url = new URL(event.request.url);
      accessToken = url.searchParams.get("accessToken");
      
      console.warn("Using access token from query parameters is less secure. Consider using Authorization header instead.");
    }

    // Check if tokens exist
    if (!accessToken) {
      console.error("No access token found in request");
      return new Response(JSON.stringify({ 
        error: "Not authenticated with Strava",
        message: "Please provide an access token in the Authorization header (preferred) or as an accessToken query parameter"
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    console.log("Access token retrieved successfully from request");
    
    // Get count from query params or default to 10
    const url = new URL(event.request.url);
    const count = url.searchParams.get("count") || "10";
    
    // Fetch activities from Strava API
    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${count}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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