// src/routes/api/callback.ts
import { type APIEvent } from '@solidjs/start/server'
import axios from 'axios'
import { getSession } from '~/utils/session'
import { z } from 'zod'
import { db } from '~/lib/db'
import * as strava from 'arctic'

const profileSchema = z.object({
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    id: z.number(),
})

/*

export async function GET(event: APIEvent) {
    console.log("Callback URL:", event.request.url);
    console.log("Query params:", Object.fromEntries(new URL(event.request.url).searchParams));

    const session = await getSession();
    console.log("Session data:", session.data);
    const url = new URL(event.request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const { state: storedState, codeVerifier } = session.data

    if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
        return new Response('Invalid state or code', { status: 400 })
    }

    // Exchange the authorization code for an access token
    const response = await axios.post('https://www.strava.com/oauth/token', null, {
        params: {
            client_id: import.meta.env.VITE_STRAVA_CLIENT_ID,
            client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: import.meta.env.VITE_STRAVA_REDIRECT_URI,
        },
    })

    const { access_token, athlete } = response.data
    const userInfo = profileSchema.parse(athlete)

    // Upsert the user to the database (or save the user)
    await db.user.upsert({
        where: { email: userInfo.email },
        update: {},
        create: {
            email: userInfo.email,
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
            stravaId: userInfo.id,
            password: "dummy",
        },
    })

    // Update the session with user info
    await session.update({
        codeVerifier: undefined,
        state: undefined,
        email: userInfo.email,
        stravaId: userInfo.id,
    })

    // Redirect to the desired page after successful authentication
    return new Response(null, {
        status: 302,
        headers: { Location: '/' },
    })
}
*/