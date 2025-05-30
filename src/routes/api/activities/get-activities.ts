import { type APIEvent } from "@solidjs/start/server";
import { getActivities } from "~/lib/activity";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";
import { replaceBigInt } from "~/utils/json-helpers";




export async function GET(event: APIEvent) {
  // Handle CORS for all responses
  const response = await handleGetRequest(event);
  return applyCors(event, response);
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}

// Move the actual request handling to a separate function
async function handleGetRequest(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const activityNumber = url.searchParams.get("activityNumber");
    if (!activityNumber) {
      return new Response(
        JSON.stringify({ error: "activityNumber is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const activities = await getActivities(parseInt(activityNumber));
    if (!activities || activities.length === 0) {
      return new Response(JSON.stringify({ error: "No activities found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Before returning the response, convert any BigInt values
    const activitiesData = replaceBigInt(activities);

    return new Response(JSON.stringify(activitiesData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch activities" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
