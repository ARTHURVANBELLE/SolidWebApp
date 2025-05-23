import { createResource, createSignal, For, Suspense } from "solid-js";
import {
  getActivitiesAction,
  getActivities,
  ActivityWithUsers,
} from "~/lib/activity";
import Layout from "~/components/Layout";
import { createAsync, createAsyncStore } from "@solidjs/router";

export default function News() {
  const activities = createAsyncStore(() => getActivities(15));

  return (
    <Layout protected={true}>
      <main class="text-center mx-auto text-gray-700 p-4">
        <div class="w-full mb-8">
          <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
            Recent Activities
          </h1>
        </div>

        <Suspense
          fallback={
            <div class="flex justify-center items-center p-8">
              <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p class="ml-3">Loading Strava activities...</p>
            </div>
          }
        >
          <div class="flex flex-col items-center">
            <For each={activities()}>
              {(activity: ActivityWithUsers) => (
                <div class="w-full max-w-2xl bg-white shadow-md rounded-lg p-4 mb-4">
                  <h2 class="text-xl font-bold">{activity.title}</h2>
                  <p class="text-gray-600">{activity.description}</p>
                  <img
                    src={activity.imageUrl[0]}
                    alt="Activity Image"
                    class="w-full h-auto rounded-lg mt-4"
                  />
                  <p class="text-gray-500">
                    Activity Time: {activity.movingTime} minutes
                  </p>
                  <p class="text-gray-500">Distance: {activity.distance} km</p>
                  <p class="text-gray-500">
                    Date: {activity.datetime.toString()}
                  </p>
                  <p class="text-gray-500">
                    Number of cyclists: {activity.users.length}
                  </p>
                </div>
              )}
            </For>
          </div>
        </Suspense>
      </main>
    </Layout>
  );
}
