// src/components/Debug.tsx
import { createSignal, onMount } from "solid-js";

export default function Debug() {
  const [sessionData, setSessionData] = createSignal<any>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [isVisible, setIsVisible] = createSignal(true);
  
  onMount(async () => {
    try {
      const response = await fetch("/api/debug-session");
      const data = await response.json();
      setSessionData(data);
    } catch (err) {
      setError((err as Error).message);
    }
  });
  
  return (
    <>
      {isVisible() ? (
        <div class="fixed bottom-4 right-4 p-4 bg-gray-100 border border-gray-300 rounded shadow max-w-md overflow-auto" style="max-height: 50vh; z-index: 9999;">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold">Debug Info</h3>
            <button 
              onClick={() => setIsVisible(false)}
              class="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Hide
            </button>
          </div>
          
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
      ) : (
        <button 
          onClick={() => setIsVisible(true)}
          class="fixed bottom-4 right-4 p-2 bg-gray-100 border border-gray-300 rounded shadow z-9999"
        >
          Show Debug
        </button>
      )}
    </>
  );
}