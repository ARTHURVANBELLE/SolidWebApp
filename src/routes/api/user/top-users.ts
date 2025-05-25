import { getTopUsers } from "~/lib/user";
import { safeJsonStringify } from "~/utils/json-helpers";

export async function GET({ request }: { request: Request }) {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    
    // Validate limit parameter first
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return new Response(JSON.stringify({
        error: "Invalid parameter",
        message: "Limit must be a number between 1 and 100"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
  try {
    const users = await getTopUsers(limit);
    
    if (!users || users.length === 0) {
      return new Response(safeJsonStringify({ error: "No users found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(safeJsonStringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error details:", error);
    return new Response(safeJsonStringify({ 
      error: "Failed to fetch top users",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
