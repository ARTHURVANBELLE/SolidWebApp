/**
 * Fetches the latest activities directly from Strava API
 * @param accessToken Strava access token
 * @param count Number of activities to fetch (default: 10)
 */
export async function getStravaActivities(accessToken: string, count: number = 10) {
  "use server";
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Make direct request to Strava API
    const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${count}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'  
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Strava API error:', response.status, await response.text());
      throw new Error(`Strava API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Strava activities:", error);
    throw error;
  }
}
