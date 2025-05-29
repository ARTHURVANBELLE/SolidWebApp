import { type APIEvent } from "@solidjs/start/server";

interface CorsOptions {
  origins?: string[];
  credentials?: boolean;
  methods?: string[];
  headers?: string[];
}

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:3000',
  'http://192.168.1.2:8081', // Common local IP address
  'exp://localhost:8081',
  'exp://192.168.1.2:8081',
  '*' // For development, remove in production
];

const DEFAULT_ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
const DEFAULT_ALLOWED_HEADERS = ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'];

/**
 * Apply CORS headers to a response
 */
export function applyCors(
  event: APIEvent, 
  response: Response, 
  options: CorsOptions = {}
): Response {
  const allowedOrigins = options.origins || DEFAULT_ALLOWED_ORIGINS;
  const origin = event.request.headers.get('origin');
  const responseHeaders = new Headers(response.headers);
  
  // Always set the credentials header to true by default for auth endpoints
  responseHeaders.set('Access-Control-Allow-Credentials', 'true');
  
  // If the origin is in our allowed list, set Access-Control-Allow-Origin
  if (origin && allowedOrigins.includes(origin)) {
    responseHeaders.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*') && !options.credentials) {
    // Only use * when not in credentials mode as it's incompatible
    responseHeaders.set('Access-Control-Allow-Origin', '*');
  } else if (origin) {
    // In development, be more permissive with origins
    if (process.env.NODE_ENV === 'development') {
      responseHeaders.set('Access-Control-Allow-Origin', origin);
    } else {
      // In production, use the first allowed origin
      responseHeaders.set('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
  }
  
  // Set Access-Control-Allow-Headers
  const allowedHeaders = options.headers || DEFAULT_ALLOWED_HEADERS;
  responseHeaders.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  
  // Create a new response with the modified headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  });
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(
  event: APIEvent,
  options: CorsOptions = {}
): Response {
  const allowedOrigins = options.origins || DEFAULT_ALLOWED_ORIGINS;
  const allowedMethods = options.methods || DEFAULT_ALLOWED_METHODS;
  const allowedHeaders = options.headers || DEFAULT_ALLOWED_HEADERS;
  const origin = event.request.headers.get('origin');
  
  const headers = new Headers();
  
  // Always set the credentials header to true for auth endpoints
  headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Set Access-Control-Allow-Origin
  if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes('*') && !options.credentials) {
    headers.set('Access-Control-Allow-Origin', '*');
  } else if (origin) {
    // In development, be more permissive with origins
    if (process.env.NODE_ENV === 'development') {
      headers.set('Access-Control-Allow-Origin', origin);
    } else {
      // In production, use the first allowed origin
      headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
  }
  
  // Set other CORS headers
  headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
  headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return new Response(null, {
    status: 204, // No content
    headers
  });
}
