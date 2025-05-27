import { type APIEvent } from "@solidjs/start/server";

// Configure allowed origins for your application
// Include both web and mobile app URIs
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8081',
  'capacitor://',
  'http://localhost',
];

export function applyCors(event: APIEvent, response: Response): Response {
  const origin = event.request.headers.get('origin') || '';
  
  // Allow requests with no origin (like mobile apps)
  const isAllowed = !origin || allowedOrigins.some(allowed => {
    return origin === allowed || origin.startsWith(allowed);
  });

  const headers = new Headers(response.headers);
  
  if (isAllowed) {
    headers.set('Access-Control-Allow-Origin', origin || '*');
  } else {
    headers.set('Access-Control-Allow-Origin', allowedOrigins[0]);
  }
  
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export function handleCorsPreflightRequest(event: APIEvent): Response | null {
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
  }
  return null;
}
