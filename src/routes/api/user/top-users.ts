import { type APIEvent } from "@solidjs/start/server";
import { getTopUsers } from "~/lib/user";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";
import { replaceBigInt } from "~/utils/json-helpers";

export async function GET(event: APIEvent) {
  // Handle CORS for all responses
  const response = await handleGetRequest(event);
  return applyCors(event, response);
}

// Move the actual request handling to a separate function
async function handleGetRequest(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({
          error: "Invalid parameter",
          message: "Limit must be a number between 1 and 100",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      const users = await getTopUsers(limit);

      if (!users || users.length === 0) {
        return new Response(JSON.stringify({ error: "No users found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      const replacedUsers = replaceBigInt(users);

      return new Response(JSON.stringify(replacedUsers), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error details:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch top users",
          details: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
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

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(event: APIEvent) {
  return handleCorsPreflightRequest(event);
}
