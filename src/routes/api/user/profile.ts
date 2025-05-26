import { type APIEvent } from "@solidjs/start/server";
import { getSession } from "~/utils/session";
import { db } from "~/lib/db";

export async function GET(event: APIEvent) {
  try {
    // Get the current authenticated user
    const session = await getSession();
    const { stravaId } = session.data;
    
    if (!stravaId) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
    }
    
    // Fetch user data from database
    const user = await db.user.findUnique({
      where: { stravaId: Number(stravaId) },
      select: {
        stravaId: true,
        firstName: true,
        lastName: true,
        email: true,
        imageUrl: true,
        // Don't include sensitive fields like tokens or password
      }
    });
    
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ user }));
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new Response(JSON.stringify({ error: "Failed to retrieve profile" }), { status: 500 });
  }
}
