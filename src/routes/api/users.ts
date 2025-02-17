import { db } from "~/lib/db"; // Import your Prisma instance
import { APIEvent } from "solid-start"; // Solid API handler

export async function GET(event: APIEvent) {
  try {
    const users = await db.user.findMany(); // Fetch users from database
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
