import { createSignal, For } from "solid-js";
import { NextButton } from "../NextButton";

export interface StravaActivity {
  id: string;
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

interface ActivitySelectorProps {
  activities: StravaActivity[];
  onActivitySelected: (activityId: string) => void;
  selectedActivityId: string | null;
  name?: string;
}

export function ActivitySelector(props: ActivitySelectorProps) {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format distance to kilometers
  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(2) + ' km';
  };

  // Format time from seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours ? hours + 'h ' : ''}${minutes}m ${secs}s`;
  };

  return (
    <div class="max-w-6xl mx-auto p-4">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Select an Activity</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <For each={props.activities}>
          {(activity) => (
            <div 
              class={`rounded-lg shadow-md p-4 cursor-pointer transition-all duration-200 hover:shadow-lg 
                ${props.selectedActivityId === activity.id 
                  ? 'bg-blue-50 border-2 border-blue-500' 
                  : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
              onClick={() => props.onActivitySelected(activity.id)}
            >
              <h3 class="text-lg font-semibold text-gray-800 mb-2 truncate">{activity.name}</h3>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Type:</span> 
                  <span class="text-gray-800">{activity.type}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Date:</span> 
                  <span class="text-gray-800">{formatDate(activity.start_date)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Distance:</span> 
                  <span class="text-gray-800">{formatDistance(activity.distance)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Time:</span> 
                  <span class="text-gray-800">{formatTime(activity.moving_time)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600 font-medium">Elevation:</span> 
                  <span class="text-gray-800">{activity.total_elevation_gain}m</span>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>
            {/* Bottom centered button with margin - unchanged */}
            <div class="mt-10 flex justify-center w-full">
              <NextButton 
                type="button" 
                class="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:from-sky-600 hover:to-blue-700 transition-all duration-200 flex items-center"
              >
                <span>Last Step (Pictures and GPX)</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </NextButton>
            </div>
    </div>
  );
}
