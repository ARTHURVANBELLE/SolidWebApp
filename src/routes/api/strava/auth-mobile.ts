import { type APIEvent } from "@solidjs/start/server";
import { getSession } from "~/utils/session";
import {getUserById} from "~/lib/user";


export async function POST(event: APIEvent) {
    const session = await getSession()
    const user = await getUserById(43913894);
    if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    await session.update({
        stravaId: user.stravaId,
        accessToken: user.accessToken ?? undefined,
    });
    
    // Make sure the session is fully updated before checking the data
    await new Promise(resolve => setTimeout(resolve, 10));
    
    if (!session.data.accessToken || !session.data.stravaId) {
        return new Response(JSON.stringify({ 
            error: 'No Strava authentication data found in session' 
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify({
        sessionToken: session.data.accessToken,
        stravaId: session.data.stravaId
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}