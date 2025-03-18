// src/routes/api/debug-session.ts
import { type APIEvent } from '@solidjs/start/server'
import { getSession } from '~/utils/session'

export async function GET(event: APIEvent) {
  try {
    const session = await getSession()
    
    // Return session data and environment variables (excluding secrets)
    return new Response(JSON.stringify({
      sessionData: session.data,
      environment: {
        VITE_STRAVA_CLIENT_ID: import.meta.env.VITE_STRAVA_CLIENT_ID,
        VITE_STRAVA_REDIRECT_URI: import.meta.env.VITE_STRAVA_REDIRECT_URI,
        // Don't include secrets here
      },
      // Include request info
      request: {
        url: event.request.url,
        headers: Object.fromEntries(Array.from(event.request.headers.entries())
          .filter(([key]) => !key.includes('cookie') && !key.includes('auth')))
      }
    }), {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}