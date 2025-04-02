import { loginAction } from "~/utils/session";
import { useSubmission } from "@solidjs/router";

const scope = ["activity:write", "read"];

export default function LoginButton() {
  const submission = useSubmission(loginAction);

  return (
    <div class="flex justify-center items-center min-h-screen bg-blue-300">
      <form 
        method="post" 
        action={loginAction} 
        class="bg-white shadow-xl rounded-2xl p-6 flex flex-col items-center space-y-4 border border-gray-200"
      >
        <h2 class="text-lg font-semibold text-gray-700">Connect with Strava</h2>
        <button
          type="submit"
          class="bg-blue-500 hover:bg-blue-700 transition-all duration-200 text-white font-bold py-3 px-6 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submission.pending}
        >
          {submission.pending ? "Redirecting..." : "Login with Strava"}
        </button>
      </form>
    </div>
  );
}
