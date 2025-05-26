import { type APIEvent } from "@solidjs/start/server";
import { z } from "zod";
import { db } from "~/lib/db";
import { getSession, updateSessionTokens } from "~/utils/session";
import { strava } from "~/utils/strava";

const profileSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  id: z.number(),
  profile: z.string(),
});

export async function GET(event: APIEvent) {
  // Return 400 error if it fails the security tests
  const session = await getSession();
  const url = new URL(event.request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const { state: storedState } = session.data;
  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, { status: 400 });
  }

  // Get token and use it to get the user's info
  const tokens = await strava.validateAuthorizationCode(code);
  const accessToken = tokens.accessToken();
  const refreshToken = tokens.refreshToken();
  
  // Update the session with the access and refresh tokens
  await updateSessionTokens(accessToken, refreshToken);
  
  const response = await fetch("https://www.strava.com/api/v3/athlete", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const user = await response.json();
  console.log(JSON.stringify(user, null, 2));

  const userInfo = profileSchema.parse(user);
  console.log(userInfo);

  // Upsert the user to the database
  await db.user.upsert({
    where: { stravaId: userInfo.id },
    update: {
      accessToken,
      refreshToken,
    },
    create: {
      firstName: userInfo.firstname,
      lastName: userInfo.lastname,
      stravaId: userInfo.id,
      password: "",
      email: "",
      imageUrl: userInfo.profile,
      accessToken,
      refreshToken,
    },
  });
 
  // Update the session
  await session.update({
    state: undefined,
    stravaId: userInfo.id,
  })
  return new Response(null, {
    status: 302,
    headers: { Location: '/' },
  })
}
