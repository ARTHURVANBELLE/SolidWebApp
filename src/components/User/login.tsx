import { loginAction } from "~/utils/session";
import { useSubmission } from "@solidjs/router";

const scope = ["activity:write", "read"];


// Client-side Strava auth without server functions
export default function LoginButton() {
  const submission = useSubmission(loginAction)

  return (
    <form method="post" action={loginAction}>
      <button
        type="submit"
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={submission.pending}
      >
        {submission.pending ? "Redirecting..." : "Login with Strava"}
      </button>
    </form>
  );
}
