import { Component, createSignal, createEffect, For, Show } from "solid-js";
import styles from "./add_files.module.css";

interface ActivityFilesProps {
  activityId: string;
  onGpxChange: (gpxUrl: string) => void;
  onImageChange?: (imageUrl: string[]) => void;
}

export const ActivityFiles: Component<ActivityFilesProps> = (props) => {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [gpxUrl, setGpxUrl] = createSignal<string | null>(null);

  // Function to fetch GPX file and return URL
  const handleGpxSelection = async (e: Event) => {
    e.preventDefault(); // Prevent form submission if in a form
    setLoading(true);
    setError(null);
    
    try {
      // This is a placeholder. Replace with your actual API call
      const response = await fetch(`/api/activities/${props.activityId}/gpx`);
      if (!response.ok) throw new Error("Failed to fetch GPX file");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Set the GPX URL and notify parent component
      setGpxUrl(url);
      props.onGpxChange(url);
      
      // Optional: Still allow downloading
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `activity-${props.activityId}.gpx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
    } catch (err) {
      setError(`Error fetching GPX: ${err instanceof Error ? err.message : String(err)}`);
      setGpxUrl(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class={styles.activityFiles}>
      <h2>Activity Files</h2>
      
      <div class={styles.gpxSection}>
        <h3>GPX Track</h3>
        <button 
          type="button" // Explicitly set type to prevent form submission
          class={styles.gpxButton}
          onClick={handleGpxSelection}
          disabled={!props.activityId || loading()}
        >
          {loading() ? 'Loading...' : 'Select GPX File'}
        </button>
        
        <Show when={error()}>
          <p class={styles.errorMessage}>{error()}</p>
        </Show>
        
        <Show when={gpxUrl()}>
          <p class={styles.successMessage}>GPX file selected successfully</p>
        </Show>
      </div>
    </div>
  );
};

