import { A } from "@solidjs/router";
import  Login  from "~/components/login";

export default function () {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">Admin Page</h1>
      <Login redirectTo="/create-member" />
    </main>
  );
}
