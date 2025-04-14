import { A } from "@solidjs/router";
import Counter from "~/components/Counter";
import Layout from "~/components/Layout";
import {getUser} from "../utils/session";
import SessionDebug from "~/components/SessionDebug";
import { createAsync } from "@solidjs/router";

export default function Home() {
    const user = createAsync(() => getUser());
    console.log(user());
  return (
    <Layout protected={true}>
      <main class="text-center mx-auto text-gray-700 p-4">
        <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
          Hello world!
        </h1>
        <Counter />
        <p class="mt-8">
        </p>
      </main>
    </Layout>
  );
}
