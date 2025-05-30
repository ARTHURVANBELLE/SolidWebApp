import { APIEvent } from "@solidjs/start/server";
import bcrypt from "bcrypt";
import { getUserById, addUserAction } from "~/lib/user";
import { applyCors, handleCorsPreflightRequest } from "~/utils/cors";


export async function GET(event: APIEvent) {
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
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const user = await getUserById(parseInt(userId));
    if (!user) {
      return new Response(JSON.stringify({ error: "No user found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(user), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

