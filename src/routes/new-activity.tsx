import { TextInput } from "~/components/TextInput";
import { addActivityAction } from "~/lib/activity";
import Slider from "~/components/Slider";
import UserList from "~/components/User/MemberList";
import Slide from "~/components/Slide";
import { NextButton } from "~/components/NextButton";
import { createStore } from "solid-js/store";

export default function NewActivity() {
  const [formData, setFormData] = createStore({
    activity: {
      title: "",
      date: "",
      time: "",
      description: "",
    },
    details: {
      users: [] as number[],
    },
    files: {
      picturesURL: [],
      gpxURL: "",
    },
  });

  return (
    <main class="flex flex-col min-h-full w-full">
      {/* Title Section at the Top */}
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8 text-center">
        Create a New Activity
      </h1>

      {/* Slider takes up remaining space */}
      <div class="flex-1 w-screen max-w-full h-full">
        <form>
          <Slider>
            <Slide>
              <TextInput
                name="title"
                type="text"
                placeholder="Activity name"
                required
                value={formData.activity.title}
                onInput={(e) => {
                  setFormData("activity", "title", e.currentTarget.value);
                }}
              />
              <TextInput
                name="date"
                type="date"
                placeholder="Activity date"
                required
                value={formData.activity.date}
                onInput={(e) => {
                  setFormData("activity", "date", e.currentTarget.value);
                }}
              />
              <TextInput
                name="time"
                type="time"
                placeholder="Activity time"
                required
                value={formData.activity.time}
                onInput={(e) => {
                  setFormData("activity", "time", e.currentTarget.value);
                }}
              />
              <NextButton>Next step</NextButton>
            </Slide>

            {/* Slide 2: User List */}
            <Slide>
              <UserList 
                onSelectionChange={(selectedIds)=> {
                  setFormData("details", "users", selectedIds);
                }}/>
              <NextButton>Next step</NextButton>
            </Slide>

            {/* Slide 3 */}
            <Slide>
              <p class="text-3xl font-bold">Slide 3</p>
              <NextButton>Next step</NextButton>
            </Slide>

            {/* Slide 4 */}
            <Slide>
              <p class="text-3xl font-bold">Slide 4</p>
              <NextButton>Next step</NextButton>
            </Slide>
          </Slider>
        </form>
      </div>
    </main>
  );
}
