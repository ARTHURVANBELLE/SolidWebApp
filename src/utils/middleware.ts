import { type APIEvent } from "@solidjs/start/server";
import { createMiddleware } from '@solidjs/start/middleware'
import { getSession } from "./session";
import { applyCors, handleCorsPreflightRequest } from "./cors";

export async function withAuth(event: APIEvent, handler: (event: APIEvent) => Promise<Response>): Promise<Response> {
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflightRequest(event);
  if (preflightResponse) {
    return preflightResponse;
  }
  
  // Check authentication
  const session = await getSession();
  if (!session.data.stravaId) {
    const response = new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
    return applyCors(event, response);
  }
  
  // Proceed with the handler
  try {
    const response = await handler(event);
    return applyCors(event, response);
  } catch (error) {
    console.error("API error:", error);
    const errorResponse = new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
    return applyCors(event, errorResponse);
  }
}

export async function withCors(event: APIEvent, handler: (event: APIEvent) => Promise<Response>): Promise<Response> {
  // Handle CORS preflight requests
  const preflightResponse = handleCorsPreflightRequest(event);
  if (preflightResponse) {
    return preflightResponse;
  }
  
  // Proceed with the handler
  try {
    const response = await handler(event);
    return applyCors(event, response);
  } catch (error) {
    console.error("API error:", error);
    const errorResponse = new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
    return applyCors(event, errorResponse);
  }
}

export default createMiddleware({
  onBeforeResponse: (event) => {
    event.response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8081')
    event.response.headers.set('Access-Control-Allow-Credentials', 'true')
  },
})