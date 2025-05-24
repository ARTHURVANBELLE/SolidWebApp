import { useSession } from "vinxi/http";
import { generateState } from "arctic";
import { strava } from "./strava";
import { action, redirect } from "@solidjs/router";
import { db } from "../lib/db";
import { query } from "@solidjs/router";

type SessionData = {
  state?: string;
  stravaId?: number;
  accessToken?: string;
  refreshToken?: string;
};

export function getSession() {
  "use server";
  return useSession<SessionData>({
    password: import.meta.env.VITE_SESSION_SECRET,
  });
}

export async function getSessionData() {
  "use server";
  const session = await getSession();
  return session.data;
}

export const login = async () => {
  "use server";
  const state = generateState();
  const baseUrl = strava.createAuthorizationURL(state, ["activity:write", "activity:read_all", "read"]);
  
  // Add approval_prompt=force to the URL
  const url = new URL(baseUrl.toString());
  url.searchParams.set("approval_prompt", "force");
  
  const session = await getSession();
  await session.update({ state });
  throw redirect(url.toString());
};

export const logout = async () => {
  "use server";
  const session = await getSession();
  await session.clear();
  return redirect("/index"); 
}

export const updateSessionTokens = async (accessToken: string, refreshToken: string) => {
  "use server";
  const session = await getSession();
  await session.update({
    accessToken,
    refreshToken
  });
  return true;
};

export const loginAction = action(login, "loginAction");

export const getUser = query(async () => {
  "use server";
  try {
    const session = await getSession();
    if (!session.data.stravaId) {
      return null;
    }

    return await db.user.findUniqueOrThrow({
      where: { stravaId: session.data.stravaId },
    });

  } catch {
    return null;
  }
}, "getUser");
