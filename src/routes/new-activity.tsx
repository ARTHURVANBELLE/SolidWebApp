import { TextInput } from "~/components/TextInput";
import Slider from "~/components/Slider";
import Slide from "~/components/Slide";
import Layout from "~/components/Layout";
import { ActivityFiles } from "~/components/Activity/add_files";
import { upsertActivityAction } from "~/lib/activity";
import {
  createSignal,
  createResource,
  Suspense,
} from "solid-js";
import MemberList from "~/components/User/MemberList";
import Slide_1 from "~/components/Activity/Slide_1";
import { getSessionData } from "~/utils/session";
import { createAsync } from "@solidjs/router";
import {
  ActivitySelector,
  StravaActivity,
} from "~/components/Activity/ActivitySelector";
import { getStravaActivities } from "~/lib/stravaActivities";

export default function NewActivity() {
  const session = createAsync(() => getSessionData());
  const [activityId, setActivityId] = createSignal<string | null>(null);
  const [activities, { refetch }] = createResource(
    () => session()?.accessToken,
    async (accessToken) => {
      if (!accessToken) return [];
      const activities = await getStravaActivities(accessToken, 9);
      return activities;
    }
  );

  const delegueId = () => {
    const userId = session()?.stravaId;
    return userId;
  }

  return (
    <Layout protected={true}>
      <main class="flex flex-col min-h-full w-full">
        {/* Title Section at the Top */}
        <h1 class="text-5xl text-sky-700 font-bold uppercase my-8 text-center">
          Create a New Activity
        </h1>

        {/* Slider takes up remaining space */}
        <div class="flex-1 w-screen max-w-full h-full">
          <form method="post" action={upsertActivityAction}>
            <Slider>
              <Slide>
                <Slide_1 />
              </Slide>

              {/* Slide 2: User List */}
              <Slide>
                <MemberList />
              </Slide>

              {/* Slide 3: Activity Selector */}
              <Slide>
                <Suspense
                  fallback={
                    <div class="flex justify-center items-center p-8">
                      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      <p class="ml-3">Loading Strava activities...</p>
                    </div>
                  }
                >
                  <div class="bg-white shadow rounded-lg p-6">
                    <ActivitySelector
                      activities={activities() || []}
                      onActivitySelected={(activityId) => {
                        setActivityId(activityId);
                        console.log("Selected activity ID:", activityId);
                      }}
                      selectedActivityId={activityId()}
                      name="activityId"
                    />
                  </div>
                </Suspense>
              </Slide>

              {/* Slide 4 */}
              <Slide>
                <ActivityFiles
                  activityId={activityId() || ""}
                  onGpxChange={(gpxUrl) => {}}
                  onImageChange={(imageUrl) => {}}
                />

                <button
                  type="submit"
                  class="bg-blue-600 text-white py-2 px-4 rounded transition"
                >
                  Register Activity
                </button>
                <input type="hidden" name="id" value={activityId() || ""} />
                <input
                  type="hidden"
                  name="imageUrl"
                  value="https://cyclotourisme-mag.com/wp-content/uploads/sites/2/2016/11/Cyclomontagnardes.jpg"
                />
                <input type="hidden" name="comments" value={""} />
                <input type="hidden" name="delegueId" value={delegueId()} />
              </Slide>
            </Slider>
          </form>
        </div>
      </main>
    </Layout>
  );
}
