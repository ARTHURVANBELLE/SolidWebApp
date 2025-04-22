import { createResource, Show, For } from "solid-js";
import { A } from "@solidjs/router";

interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  // Add other fields as needed
}

export default function StravaActivities() {
  // Function to get full URL for API endpoints
  const getApiUrl = (path: string) => {
    // In browser environment, use the current origin
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${path}`;
    }
    // For server-side rendering, use absolute URL with a known base
    return `http://localhost:3000${path}`;
  };

  // Function to fetch activities using our API
  const fetchActivities = async () => {
    try {
      // Skip fetch during server-side rendering to avoid URL resolution issues
      if (typeof window === 'undefined') {
        console.log("Skipping fetch during SSR");
        return []; // Return empty array for initial SSR
      }
      
      const url = getApiUrl('/api/strava/activities');
      console.log("Fetching from URL:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(data.error || "Failed to fetch activities");
      }
      
      console.log("Last 10 activities:", data);
      return data;
    } catch (error) {
      console.error("Error fetching Strava activities:", error);
      throw error;
    }
  };

  // Create a resource for activities
  const [activities, { refetch }] = createResource(fetchActivities);

  // Format seconds to hours:minutes:seconds
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${secs}s`;
  };

  // Format distance from meters to kilometers
  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + " km";
  };

  return (
    <div class="strava-activities p-4">
      <h2 class="text-2xl font-bold mb-4">Strava Activities</h2>
      
      <div class="mb-4">
        <button 
          onClick={() => refetch()}
          class="px-4 py-2 bg-orange-500 text-white rounded-md"
        >
          Refresh Activities
        </button>
      </div>
      
      <Show when={activities.loading}>
        <p>Loading activities...</p>
      </Show>
      
      <Show when={activities.error}>
        <p class="text-red-500">Error: {activities.error?.message}</p>
      </Show>
      
      <Show when={activities() && !activities.loading}>
        <div class="space-y-4">
          <For each={activities()}>
            {(activity: StravaActivity) => (
              <div class="border p-4 rounded-lg">
                <h3 class="font-semibold text-lg">{activity.name}</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <div>
                    <span class="text-sm text-gray-500">Type:</span>
                    <p>{activity.type}</p>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Distance:</span>
                    <p>{formatDistance(activity.distance)}</p>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Moving Time:</span>
                    <p>{formatTime(activity.moving_time)}</p>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Elevation Gain:</span>
                    <p>{activity.total_elevation_gain} m</p>
                  </div>
                </div>
                <p class="text-sm mt-2">
                  Date: {new Date(activity.start_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
