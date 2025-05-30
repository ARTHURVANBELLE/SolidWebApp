import { type APIEvent } from "@solidjs/start/server";
import { getTeams } from "~/lib/team";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";

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

    const teams = await getTeams();
    if (!teams || teams.length === 0) {
      return new Response(JSON.stringify({ error: "No teams found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(teams), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch teams" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
