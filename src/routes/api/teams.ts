import { db } from "~/lib/db";
import { APIEvent } from "@solidjs/start/server";

export async function GET(event: APIEvent) {
  try {
    const teams = await db.team.findMany();
    return new Response(JSON.stringify(teams), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch teams" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json();

    const newTeam = await db.team.create({
      data: {
        name: body.name,
      },
    });

    return new Response(JSON.stringify(newTeam), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to create team" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
