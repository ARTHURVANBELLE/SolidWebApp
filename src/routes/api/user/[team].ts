import { APIEvent } from "@solidjs/start/server";
import { getUsersByTeam } from "~/lib/user";

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

    const users = await getUsersByTeam(parseInt(teamId));

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
