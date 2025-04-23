import { createResource, Show, For, createSignal } from "solid-js";
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
  average_speed: number;
  max_speed: number;
}

export default function StravaActivities() {
  // Track the selected activity ID
  const [selectedActivityId, setSelectedActivityId] = createSignal<number | null>(null);

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

      console.log("API response:", data);
      
      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(data.error || "Failed to fetch activities");
      }
      
      // Filter activities to only include those of type "Run"
      const runActivities = data.filter((activity: StravaActivity) => activity.type === "Run");
      console.log("Run activities:", runActivities);
      
      return runActivities;

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

  const formatSpeed = (speed: number) => {
    const kmh = speed * 3.6; // Convert m/s to km/h
    return kmh.toFixed(2) + " km/h";
  };

  // Toggle selection of an activity
  const toggleActivitySelection = (activityId: number) => {
    if (selectedActivityId() === activityId) {
      // Deselect if already selected
      setSelectedActivityId(null);
    } else {
      // Select this activity
      setSelectedActivityId(activityId);
    }
  };

  // Check if an activity is selected
  const isActivitySelected = (activityId: number) => {
    return selectedActivityId() === activityId;
  };

  return (
    <div class="strava-activities p-4">
      <h2 class="text-2xl font-bold mb-4">Strava Activities</h2>
      
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
              <div 
                class={`border p-4 rounded-lg cursor-pointer transition-colors ${
                  isActivitySelected(activity.id) 
                    ? "bg-blue-50 border-blue-300" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => toggleActivitySelection(activity.id)}
              >
                <h3 class="font-semibold text-lg">{activity.name}</h3>
                
                {/* Basic info always visible */}
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <div>
                    <span class="text-sm text-gray-500">Distance:</span>
                    <p>{formatDistance(activity.distance)}</p>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Moving Time:</span>
                    <p>{formatTime(activity.moving_time)}</p>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Average Speed:</span>
                    <p>{formatSpeed(activity.average_speed)}</p>
                  </div>
                  <div>
                    <span class="text-sm text-gray-500">Elevation Gain:</span>
                    <p>{activity.total_elevation_gain} m</p>
                  </div>
                </div>
                
                {/* Show date for all activities */}
                <p class="text-sm mt-2">
                  Date: {new Date(activity.start_date).toLocaleDateString()}
                </p>
                
                {/* Expanded details only for selected activity */}
                <Show when={isActivitySelected(activity.id)}>
                  <div class="mt-4 pt-4 border-t">
                    <h4 class="font-medium text-base mb-2">Additional Details</h4>
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <span class="text-sm text-gray-500">Max Speed:</span>
                        <p>{formatSpeed(activity.max_speed)}</p>
                      </div>
                      <div>
                        <span class="text-sm text-gray-500">Total Elapsed Time:</span>
                        <p>{formatTime(activity.elapsed_time)}</p>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
