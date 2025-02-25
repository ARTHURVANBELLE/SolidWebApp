import { redirect, useNavigate } from "@solidjs/router";
import { TextInput } from "~/components/TextInput";
import { addActivityAction } from "~/lib/activity";
import Slider from "~/components/Slider";
import UserList from "~/components/UserList";
import Slide from "~/components/Slide";

export default function NewActivity() {
  const navigate = useNavigate();
  return (
    <main class="flex flex-col min-h-full w-full">
      {/* Title Section at the Top */}
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8 text-center">
        Create a New Activity
      </h1>

      {/* Slider takes up remaining space */}
      <div class="flex-1 w-screen max-w-full h-full">
        <Slider>
          {/* Slide 1: Form */}
          <Slide class="keen-slider__slide flex items-center justify-center h-full">
            <form
              method="post"
              action={addActivityAction}
              class="flex flex-col gap-4"
            >
              <TextInput
                name="title"
                type="text"
                placeholder="Enter activity title"
                required={true}
              />

              {/* Submit Button */}
              <button
                type="submit"
                class="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </form>
          </Slide>

          {/* Slide 2: User List */}
          <Slide class="keen-slider__slide flex items-center justify-center h-full">
            <UserList />
          </Slide>

          {/* Slide 3 */}
          <Slide class="flex items-center justify-center h-full">
            <p class="text-3xl font-bold">Slide 3</p>
          </Slide>

          {/* Slide 4 */}
          <Slide class="keen-slider__slide flex items-center justify-center h-full">
            <p class="text-3xl font-bold">Slide 4</p>
          </Slide>
        </Slider>
      </div>
    </main>
  );
}