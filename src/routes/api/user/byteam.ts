import { db } from "../../../lib/db";
import { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const teamId = url.pathname.split("/").pop();

    if (!teamId) {
      return new Response(JSON.stringify({ error: "Team ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch users with the specific team ID
    const users = await db.user.findMany({
      where: { teamId: parseInt(teamId) },
    });

    if (!users) {
      return new Response(JSON.stringify({ error: "No users found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(users), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
