import { APIEvent } from "@solidjs/start/server";
import bcrypt from "bcrypt";
import { getUserById, addUserAction } from "~/lib/user";

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const users = await getUserById(parseInt(userId));
    
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
