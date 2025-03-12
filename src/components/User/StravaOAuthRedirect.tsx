import { onMount } from "solid-js";

const clientId = "YOUR_CLIENT_ID"; // Replace with your Strava Client ID
const redirectUri = "YOUR_REDIRECT_URI"; // Replace with your redirect URI
const responseType = "code";
const scope = "read,activity:read_all"; // Adjust scopes as needed

export default function StravaOAuthRedirect() {
  onMount(() => {
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=${responseType}&scope=${scope}`;
    window.location.href = authUrl;
  });

  return (
    <div class="flex justify-center items-center h-full">
      <p>Redirecting to Strava for authorization...</p>
    </div>
  );
}
