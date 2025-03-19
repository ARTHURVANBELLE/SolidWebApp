// src/components/Login.tsx
//import { action } from "@solidjs/start/server";
import {action, redirect} from "@solidjs/router"
import { getLoginUrl } from "~/utils/session";

const  login = action(async () => {
  const loginUrl = await getLoginUrl();
  return redirect(loginUrl);
});

// Then in your component:
export default function LoginButton() {
  return (
    <form>
      <button type="submit" formAction={login}>
        Login with Strava
      </button>
    </form>
  );
}