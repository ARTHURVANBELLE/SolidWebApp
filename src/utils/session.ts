import { useSession } from 'vinxi/http';
import { generateCodeVerifier, generateState, Strava } from "arctic";

type SessionData = {
  email?: string;
  state?: string;
  codeVerifier?: string;
  stravaId?: number;
}

export const stravaClientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
export const stravaClientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
export const stravaRedirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI;

const strava = new Strava(stravaClientId, stravaClientSecret, stravaRedirectUri);

export function getSession() {
  'use server'
  return useSession<SessionData>({
    password: import.meta.env.VITE_SESSION_SECRET,
  });
}

export async function saveAuthState(state: string, codeVerifier: string) {
  'use server'
  const session = await getSession();
  await session.update({ state, codeVerifier });
  return session;
}

export async function getLoginUrl() {
  'use server'
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const scopes = ["activity:write", "read"];
  
  const url = await strava.createAuthorizationURL(state, scopes);
  
  await saveAuthState(state, codeVerifier);
  
  return url;
}