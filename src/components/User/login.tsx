// src/components/Login.tsx
import { createServerAction$ } from "solid-start/server";
import { redirect } from "solid-start";
import { getLoginUrl } from "~/utils/session";

export default function Login(props: { redirectTo?: string }) {
  const [_, { Form }] = createServerAction$(async () => {
    const loginUrl = await getLoginUrl();
    return redirect(loginUrl);
  });

  return (
    <div>
      <h2 class="text-xl font-bold">Login</h2>
      <Form>
        <button
          class="w-[200px] rounded-full bg-gray-100 border-2 border-gray-300 focus:border-gray-400 active:border-gray-400 px-[2rem] py-[1rem]"
          type="submit">
          Login with Strava
        </button>
      </Form>
    </div>
  );
}