import { useSession } from 'vinxi/http';
import { generateCodeVerifier, generateState, Strava } from "arctic";
import { strava } from './strava';
import { action, redirect } from '@solidjs/router';


type SessionData = {
  email?: string;
  state?: string;
  stravaId?: number;
}

export function getSession() {
  'use server'
  return useSession<SessionData>({
    password: import.meta.env.VITE_SESSION_SECRET,
  });
}

export const login = async () => {
  'use server'
  const state = generateState();
  const url = strava.createAuthorizationURL(state, ['activity:write', 'read']);
  const session = await getSession()
  await session.update({ state })
  throw redirect(url.toString())
}

export const loginAction = action(login, 'loginAction')