import { type APIEvent } from "@solidjs/start/server";
import { getActivities } from "~/lib/activity";

// Add this helper function at the top of the file
function replaceBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(replaceBigInt);
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = replaceBigInt(obj[key]);
    }
    return result;
  }
  
  return obj;
}

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url);
    const activityNumber = url.searchParams.get("activityNumber");
    if (!activityNumber) {
      return new Response(
        JSON.stringify({ error: "activityNumber is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const activities = await getActivities(parseInt(activityNumber));
    if (!activities || activities.length === 0) {
      return new Response(JSON.stringify({ error: "No activities found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Before returning the response, convert any BigInt values
    const activitiesData = replaceBigInt(activities);

    return new Response(JSON.stringify(activitiesData), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch activities" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
