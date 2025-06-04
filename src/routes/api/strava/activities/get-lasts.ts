import { type APIEvent } from "@solidjs/start/server";
import { validateAccessToken, extractTokenFromHeader } from "~/utils/jwt";
import { db } from "~/lib/db";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";
import { getStravaActivities } from "~/lib/stravaActivities";

/**
 * Fetches the latest activities from Strava API
 * @param event API event containing request details
 * @returns JSON response with activities or error message
 */
export async function GET(event: APIEvent) {
  try {
    // Get the JWT token from the Authorization header
    const authHeader = event.request.headers.get("Authorization");
    let jwtToken: string | null = extractTokenFromHeader(authHeader || "");
    
    // Return error if no token provided
    if (!jwtToken) {
      return createErrorResponse(
        event,
        "Authentication required",
        "Please provide a valid JWT token via Authorization header",
        401
      );
    }
    
    // For tokens that don't validate through regular methods,
    // attempt to lookup matching token in database
    const allTokens = await db.token.findMany({
      select: {
        userId: true,
        jwt: true,
        accessToken: true,
      }
    });
    
    // Find a database token that matches the provided JWT (partial match)
    let tokenMatch = null;
    for (const dbToken of allTokens) {
      if (dbToken.jwt && (
          dbToken.jwt.includes(jwtToken.substring(0, 30)) || 
          jwtToken.includes(dbToken.jwt.substring(0, 30))
      )) {
        tokenMatch = dbToken;
        break;
      }
    }
    
    // If we found a matching token with an access token, use it
    if (tokenMatch && tokenMatch.accessToken) {
      const url = new URL(event.request.url);
      const count = parseInt(url.searchParams.get("count") || "10", 10);
      
      // Validate count parameter
      if (isNaN(count) || count < 1 || count > 100) {
        return createErrorResponse(
          event,
          "Invalid parameter",
          "Count must be a number between 1 and 100",
          400
        );
      }
      
      try {
        // Fetch activities and return them
        const activities = await getStravaActivities(tokenMatch.accessToken, count);
        
        return applyCors(event, new Response(JSON.stringify(activities), {
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "private, max-age=60" 
          }
        }));
      } catch (error) {
        return handleStravaError(event, error);
      }
    }
    
    // If direct token lookup fails, try regular JWT validation
    const tokenPayload = validateAccessToken(jwtToken);
    
    if (!tokenPayload || !tokenPayload.userId) {
      return createErrorResponse(
        event,
        "Invalid token",
        "The provided authentication token is invalid",
        401
      );
    }
    
    // Use embedded access token if available in the JWT
    if (tokenPayload.accessToken) {
      const url = new URL(event.request.url);
      const count = parseInt(url.searchParams.get("count") || "10", 10);
      
      try {
        const activities = await getStravaActivities(tokenPayload.accessToken, count);
        return applyCors(event, new Response(JSON.stringify(activities), {
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "private, max-age=60" 
          }
        }));
      } catch (error) {
        // Continue to try database token if this fails
      }
    }
    
    // Look up the token in the database using the userId from the validated JWT
    const userId = tokenPayload.userId;
    const tokenRecord = await db.token.findUnique({
      where: { userId: userId }
    });
    
    if (!tokenRecord || !tokenRecord.accessToken) {
      return createErrorResponse(
        event,
        "Strava authorization required",
        "Your account is not connected to Strava or the connection has expired",
        401
      );
    }
    
    // Get the count parameter
    const url = new URL(event.request.url);
    const count = parseInt(url.searchParams.get("count") || "10", 10);
    
    try {
      const activities = await getStravaActivities(tokenRecord.accessToken, count);
      
      return applyCors(event, new Response(JSON.stringify(activities), {
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "private, max-age=60"
        }
      }));
    } catch (error) {
      return handleStravaError(event, error);
    }
  } catch (error) {
    return createErrorResponse(
      event,
      "Internal server error", 
      error instanceof Error ? error.message : String(error),
      500
    );
  }
}

/**
 * Handle errors from Strava API consistently
 */
function handleStravaError(event: APIEvent, error: any) {
  if (typeof error === 'object' && error && 'status' in error && error.status === 401) {
    return createErrorResponse(
      event,
      "Authentication failed",
      "Your Strava authentication has expired. Please reconnect your account.",
      401
    );
  }
  
  return createErrorResponse(
    event,
    "Strava API error",
    error instanceof Error ? error.message : "Error fetching activities",
    (typeof error === 'object' && error && 'status' in error) ? Number(error.status) : 500
  );
}

/**
 * Helper function to create standardized error responses with CORS headers
 */
function createErrorResponse(event: APIEvent, error: string, message: string, status: number = 400) {
  return applyCors(event, new Response(JSON.stringify({ 
    error: error, 
    message: message
  }), {
    status: status,
    headers: { 
      "Content-Type": "application/json",
      ...(status === 401 ? { "WWW-Authenticate": "Bearer" } : {})
    }
  }));
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}