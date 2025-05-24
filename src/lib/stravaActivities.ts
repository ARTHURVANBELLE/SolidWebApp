/**
 * Fetches the latest activities from Strava via our API
 * @param accessToken Strava access token
 * @param count Number of activities to fetch (default: 10)
 */
export async function getStravaActivities(accessToken: string, count: number = 10) {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Check if window is defined (browser environment)
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}`
      : process.env.API_BASE_URL || 'http://localhost:3000'; // Fallback URL for server environment
    
    const response = await fetch(`${baseUrl}/api/strava/activities/get-lasts?count=${count}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'  
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
