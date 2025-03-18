import { useSession } from 'vinxi/http'
import { generateCodeVerifier, generateState } from "arctic"
import { crypto } from "~/utils/crypto"

type SessionData = {
  email?: string
  state?: string
  codeVerifier?: string
  stravaId?: number
}

export function getSession() {
  'use server'
  return useSession<SessionData>({
    password: import.meta.env.VITE_SESSION_SECRET,
  })
}

export const saveAuthState = async (state: string, codeVerifier: string) => {
  'use server'
  const session = await getSession()
  await session.update({ state, codeVerifier })
}

export const stravaClientId = import.meta.env.VITE_STRAVA_CLIENT_ID
export const stravaClientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET
export const stravaRedirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI

// Helper function to generate code challenge from verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Get the login URL for Strava OAuth
export const getLoginUrl = async () => {
  'use server'
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Strava OAuth authorization URL
  const url = new URL("https://www.strava.com/oauth/authorize")
  url.searchParams.set('client_id', stravaClientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', stravaRedirectUri)
  url.searchParams.set('scope', 'read,profile:read_all,activity:read')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', codeChallenge)  // Now using proper code challenge
  url.searchParams.set('code_challenge_method', 'S256')

  // Save the auth state for later validation
  await saveAuthState(state, codeVerifier)
  return url.toString()
}