import { createSignal, For } from "solid-js";

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
    <div class="activity-selector">
      <h2>Select an Activity</h2>
      <div class="activity-list">
        <For each={props.activities}>
          {(activity) => (
            <div 
              class={`activity-card ${props.selectedActivityId === activity.id ? 'selected' : ''}`}
              onClick={() => props.onActivitySelected(activity.id)}
            >
              <h3>{activity.name}</h3>
              <div class="activity-details">
                <div><strong>Type:</strong> {activity.type}</div>
                <div><strong>Date:</strong> {formatDate(activity.start_date)}</div>
                <div><strong>Distance:</strong> {formatDistance(activity.distance)}</div>
                <div><strong>Time:</strong> {formatTime(activity.moving_time)}</div>
                <div><strong>Elevation:</strong> {activity.total_elevation_gain}m</div>
              </div>
            </div>
          )}
        </For>
      </div>

      <style>
        {`
        .activity-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-top: 16px;
        }
        
        .activity-card {
          padding: 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .activity-card:hover {
          background-color: #f5f5f5;
        }
        
        .activity-card.selected {
          background-color: #e6f7ff;
          border-color: #1890ff;
        }
        
        .activity-details {
          margin-top: 8px;
          font-size: 0.9rem;
        }
        `}
      </style>
    </div>
  );
}
