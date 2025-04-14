import { useSession } from "vinxi/http";
import { generateState } from "arctic";
import { strava } from "./strava";
import { action, redirect } from "@solidjs/router";
import { db } from "../lib/db";
import { query } from "@solidjs/router";

type SessionData = {
  state?: string;
  stravaId?: number;
};

export function getSession() {
  "use server";
  return useSession<SessionData>({
    password: import.meta.env.VITE_SESSION_SECRET,
  });
}

export const login = async () => {
  "use server";
  const state = generateState();
  const url = strava.createAuthorizationURL(state, ["activity:write", "read"]);
  const session = await getSession();
  await session.update({ state });
  throw redirect(url.toString());
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
