import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { strava } from "~/utils/strava";
import { getSession } from "~/utils/session";

const requestSchema = z.object({
  redirect_uri: z.string().url()
});

export async function POST(event: APIEvent) {
  try {
    // Parse and validate the request body
    const body = await event.request.json();
    const { redirect_uri } = requestSchema.parse(body);
    
    // Generate a state parameter for CSRF protection
    const state = crypto.randomUUID();
    
    // Store state in session
    const session = await getSession();
    await session.update({ state });
    
    // Generate the authorization URL
    const url = strava.createAuthorizationURL(state, ["profile:read_all", "activity:read"]);
    
    return new Response(JSON.stringify({ url }));
  } catch (error) {
    console.error("Error generating Strava auth URL:", error);
    return new Response(JSON.stringify({ error: "Failed to generate authentication URL" }), { status: 400 });
  }
}
