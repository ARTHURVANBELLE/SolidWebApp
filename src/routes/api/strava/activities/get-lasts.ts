import { type APIEvent } from "@solidjs/start/server";
/**
 * Fetches the latest activities from Strava API
 * @param event API event containing request details
 * @returns JSON response with activities or error message
 */
export async function GET(event: APIEvent) {
  try {
    // Get the access token from the Authorization header
    const authHeader = event.request.headers.get("Authorization");
    let accessToken: string | null = null;
    
    if (authHeader) {
      // Extract token from Authorization header (Bearer token)
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (match) {
        accessToken = match[1];
      } else {
        // Malformed Authorization header
        return new Response(JSON.stringify({ 
          error: "Invalid authorization format",
          message: "Authorization header must use Bearer scheme"
        }), {
          status: 401,
          headers: { 
            "Content-Type": "application/json",
            "WWW-Authenticate": "Bearer" 
          }
        });
      }
    }
      
      if (!accessToken) {
        return new Response(JSON.stringify({ 
          error: "Authentication required",
          message: "Please provide an access token via Authorization header"
        }), {
          status: 401,
          headers: { 
            "Content-Type": "application/json",
            "WWW-Authenticate": "Bearer" 
          }
        });
      }
    
    // Get count from query params or default to 10
    const url = new URL(event.request.url);
    const count = parseInt(url.searchParams.get("count") || "10", 10);
    
    // Validate count parameter
    if (isNaN(count) || count < 1 || count > 100) {
      return new Response(JSON.stringify({
        error: "Invalid parameter",
        message: "Count must be a number between 1 and 100"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Fetch activities from Strava API
    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${count}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept": "application/json"
      },
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      let error;
      try {
        error = JSON.parse(errorBody);
      } catch {
        error = { message: errorBody };
      }
      
      // Handle specific Strava error codes
      if (response.status === 401) {
        console.error("Unauthorized: Access token may have expired");
        return new Response(JSON.stringify({
          error: "Authentication failed",
          message: "Your Strava authentication has expired. Please reconnect your account."
        }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      return new Response(JSON.stringify({
        error: "Strava API error",
        details: error
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const activities = await response.json();
    
    return new Response(JSON.stringify(activities), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=60" // Cache for 1 minute
      }
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