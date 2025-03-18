// src/routes/api/session.ts
import { generateCodeVerifier, generateState } from "arctic"
import axios from "axios"
import { saveAuthState } from "~/utils/session"

// Replace by your provider
export const stravaClientId = import.meta.env.VITE_STRAVA_CLIENT_ID
export const stravaClientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET
export const stravaRedirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI

// Get the login URL for Strava OAuth
export const getLoginUrl = async () => {
  'use server'
  const state = generateState()
  const codeVerifier = generateCodeVerifier()

  // Strava OAuth authorization URL
  const url = new URL("https://www.strava.com/oauth/authorize")
  url.searchParams.set('client_id', stravaClientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', stravaRedirectUri)
  url.searchParams.set('scope', 'read,profile:read_all,activity:read')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', codeVerifier)  // Required for PKCE
  url.searchParams.set('code_challenge_method', 'S256')  // Required for PKCE

  // Save the auth state for later validation
  await saveAuthState(state, codeVerifier)
  return url.toString()
}
