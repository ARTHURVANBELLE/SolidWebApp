import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { strava } from "~/utils/strava";
import { getSession } from "~/utils/session";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";

const requestSchema = z.object({
  redirect_uri: z.string().url(),
});

const urlRequestSchema = requestSchema.extend({
  platform: z.string(),
  session_id: z.string().optional(),
});

export async function POST(event: APIEvent) {
  try {
    // Parse and validate the request body
    const body = await event.request.json();
    const { redirect_uri, platform, session_id } = urlRequestSchema.parse(body);

    // Generate a state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in session
    const session = await getSession();
    await session.update({
      state: state,
      authRequestData: {
        redirect_uri,
        platform,
        session_id: session_id || state, // Use session_id if provided, otherwise use state
        timestamp: Date.now(),
      },
    });

    // Generate the authorization URL
    const url = strava.createAuthorizationURL(state, [
      "profile:read_all",
      "activity:read",
    ]);

    console.log("Generated Strava auth URL:", url.toString());
    // Append redirect_uri to the URL
    const urlObj = new URL(url.toString());
    urlObj.searchParams.set("redirect_uri", redirect_uri);

    // Create response with CORS headers using the utility function
    const response = new Response(JSON.stringify({ url: urlObj.toString() }), {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Apply CORS headers using the utility
    return applyCors(event, response);
  } catch (error) {
    console.error("Error generating Strava auth URL:", error);

    const response = new Response(
      JSON.stringify({ error: "Failed to generate authentication URL" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Apply CORS headers using the utility
    return applyCors(event, response);
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(event: APIEvent) {
  // Handle CORS preflight request using the utility
  return handleCorsPreflightRequest(event);
}
