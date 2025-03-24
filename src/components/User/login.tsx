import { createSignal } from "solid-js";
import { Strava, generateState } from "arctic";

export const stravaClientId = import.meta.env.VITE_STRAVA_CLIENT_ID;
export const stravaClientSecret = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
export const stravaRedirectUri = import.meta.env.VITE_STRAVA_REDIRECT_URI;
const scope = ["activity:write", "read"];


// Client-side Strava auth without server functions
export default function LoginButton() {
  const [isLoading, setIsLoading] = createSignal(false);

  const strava = new Strava(
    stravaClientId,
    stravaClientSecret,
    stravaRedirectUri
  );

  const handleLogin = () => {
    setIsLoading(true);
    const state = generateState();

    // Store state in localStorage for verification later
    localStorage.setItem("stravaAuthState", state);
    const url = strava.createAuthorizationURL(state, scope);

    // Redirect to Strava authorization page
    window.location.href = url.toString();
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
