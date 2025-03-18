// src/components/Login.tsx
import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { TextInput } from "../TextInput";
import { redirect } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { getLoginUrl } from "~/routes/api/session";

export default function Login(props: { redirectTo?: string }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(props.redirectTo || "/dashboard");
  };

  const [_, { Form }] = createServerAction$(async () => {
    throw redirect(await getLoginUrl())
  })

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
