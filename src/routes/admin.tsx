import { A } from "@solidjs/router";
import  LoginButton  from "~/components/User/login";

export default function () {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">Admin Page</h1>
      {/*<Login/>*/}
      <LoginButton/>
    </main>
  );
}
