import Layout from "~/components/Layout";
import {getUser, getSessionData} from "../utils/session";
import { createAsync } from "@solidjs/router";
import pelotonImage from "~/assets/image/large_peloton.jpg";


export default function Home() {
    const user = createAsync(() => getUser());

    const session = createAsync(() => getSessionData());
    console.log(session());

  return (
    <Layout protected={true}>
      <main class="text-center mx-auto text-gray-700 p-4">
        <div class="w-full mb-8">
          <img 
            src={pelotonImage} 
            alt="Large peloton cycling image" 
            class="w-full object-cover max-h-[250px]" 
          />
        </div>
        <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16 justify-baseline">
          Coming events
        </h1>
        <p class="mt-8">
        </p>
      </main>
    </Layout>
  );
}
