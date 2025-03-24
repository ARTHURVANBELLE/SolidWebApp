
/*
import { createAsync, useNavigate } from "@solidjs/router";
import { getLoginUrl } from "~/utils/session";

export default function LoginButton() {
  const navigate = useNavigate();
  
  const handleLogin = async () => {
    const loginUrl = await getLoginUrl();
    window.location.href = loginUrl.toString();
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogin}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Login with Strava
      </button>
    </div>
  );
}

*/


import { createSignal } from "solid-js";

// Client-side Strava auth without server functions
export default function LoginButton() {
  const [isLoading, setIsLoading] = createSignal(false);
  
  // Constants for Strava OAuth
  const clientId = "152501";
  const redirectUri = encodeURIComponent("http://localhost:3000/routes/api/callback");
  const scope = encodeURIComponent("activity:write,read");
  
  // Generate a random state for security
  const generateRandomState = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleLogin = () => {
    setIsLoading(true);
    
    // Generate state
    const state = generateRandomState();
    
    // Store state in localStorage for verification later
    localStorage.setItem('stravaAuthState', state);
    
    // Construct the Strava authorization URL
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    
    // Redirect to Strava authorization page
    window.location.href = authUrl;
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogin}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={isLoading()}
      >
        {isLoading() ? "Redirecting..." : "Login with Strava"}
      </button>
    </div>
  );
}