import { createSignal,  } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { TextInput } from "../TextInput";


export default function Login(props: { redirectTo?: string }) {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate(props.redirectTo || "/dashboard");
  };

  return (
    <div>
      <h2 class="text-xl font-bold">Login</h2>
      <TextInput
        name="login"
        type="text"
        label="Login"
        value=""
        error=""
        required
        ref={() => {}}
        onInput={() => {}}
        onChange={() => {}}
        onBlur={() => {}}
      />
      <TextInput
        name="password"
        type="password"
        label="Password"
        value=""
        error=""
        required
        ref={() => {}}
        onInput={() => {}}
        onChange={() => {}}
        onBlur={() => {}}
      />
      <button
      class="w-[200px] rounded-full bg-gray-100 border-2 border-gray-300 focus:border-gray-400 active:border-gray-400 px-[2rem] py-[1rem]"
      onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
