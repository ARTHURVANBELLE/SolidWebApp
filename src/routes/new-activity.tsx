import { TextInput } from "~/components/TextInput";
import Slider from "~/components/Slider";
import UserList from "~/components/User/MemberList";
import Slide from "~/components/Slide";
import { NextButton } from "~/components/NextButton";
import Layout from "~/components/Layout";
import StravaActivities from "~/components/Activity/StravaActivities";
import {ActivityFiles} from "~/components/Activity/add_files";
import { upsertActivityAction } from "~/lib/activity";
import { createSignal, on } from "solid-js";


export default function NewActivity() {

  const [activityId, setActivityId] = createSignal<string | null>(null);

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
                <TextInput
                  name="title"
                  type="text"
                  placeholder="Activity name"
                  required
                />
                <TextInput
                  name="date"
                  type="date"
                  placeholder="Activity date"
                  required
                />
                <NextButton>Next step</NextButton>
              </Slide>

              {/* Slide 2: User List */}
              <Slide>
                <UserList />
                <NextButton>Next step</NextButton>
              </Slide>

              {/* Slide 3 */}
              <Slide>
                <StravaActivities onSelectionChange={setActivityId}/>
                <NextButton>Next step</NextButton>
              </Slide>

              {/* Slide 4 */}
              <Slide>
                <ActivityFiles 
                  activityId={activityId() || ""}
                  onGpxChange={(gpxUrl) => {}}
                  onImageChange={(imageUrl) => {}}
                />
                <div class="flex flex-col gap-2 mt-4">
                  <button
                    type="submit"
                    class="btn btn-primary bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                  >
                    Register Activity
                  </button>
                </div>
              </Slide>
            </Slider>
            <input type="hidden" name="id" value={activityId() || ""} />
            <input type="hidden" name="imageUrl" value={""} />
            <input type="hidden" name="comments" value={""} />
            <input type="hidden" name="users" value={""} />
          </form>
        </div>
      </main>
    </Layout>
  );
}
