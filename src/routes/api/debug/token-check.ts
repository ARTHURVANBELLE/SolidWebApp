import { type APIEvent } from "@solidjs/start/server";
import { db } from "~/lib/db";
import { applyCors } from "~/utils/cors";

/**
 * Debug endpoint to check token storage in the database
 * Only available in development mode
 */
export async function GET(event: APIEvent) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not available in production", { status: 403 });
  }
  
  try {
    const url = new URL(event.request.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return new Response(JSON.stringify({
        error: "Missing userId parameter"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Find token in database
    const token = await db.token.findUnique({
      where: { userId: Number(userId) }
    });
    
    // Find user
    const user = await db.user.findUnique({
      where: { stravaId: Number(userId) }
    });
    
    // Get schema details
    const tokenInfo = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Token'
    `;
    
    const response = {
      tokenFound: !!token,
      userFound: !!user,
      tokenFields: token ? Object.keys(token).map(key => ({
        field: key, 
        hasValue: !!token[key as keyof typeof token],
        valueType: typeof token[key as keyof typeof token]
      })) : [],
      schema: tokenInfo,
      userId: Number(userId)
    };
    
    return applyCors(event, new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));
  } catch (error) {
    return applyCors(event, new Response(JSON.stringify({
      error: "Error checking token",
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }));
  }
}
