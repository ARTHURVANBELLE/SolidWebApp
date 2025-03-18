import { createSignal, onMount } from "solid-js";

export default function Debug() {
  const [sessionData, setSessionData] = createSignal<any>(null);
  const [error, setError] = createSignal<string | null>(null);
  
  onMount(async () => {
    try {
      // This would need to be adjusted based on how you're storing session data
      const response = await fetch("/api/debug-session");
      const data = await response.json();
      setSessionData(data);
    } catch (err) {
      setError((err as Error).message);
    }
  });
  
  return (
    <div class="fixed bottom-4 right-4 p-4 bg-gray-100 border border-gray-300 rounded shadow max-w-md overflow-auto" style="max-height: 50vh; z-index: 9999;">
      <h3 class="font-bold mb-2">Debug Info</h3>
      
      {error() && (
        <div class="text-red-600 mb-2">Error: {error()}</div>
      )}
      
      <div>
        <h4 class="font-semibold">Session Data:</h4>
        <pre class="text-xs bg-gray-50 p-2 rounded overflow-auto">
          {JSON.stringify(sessionData(), null, 2) || "Loading..."}
        </pre>
      </div>
    </div>
  );
}