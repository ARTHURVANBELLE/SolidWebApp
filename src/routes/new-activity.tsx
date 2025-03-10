import { redirect, useNavigate } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { TextInput } from "~/components/TextInput";
import { addActivityAction } from "~/lib/activity";
import Slider from "~/components/Slider";
import UserList from "~/components/MemberList";
import Slide from "~/components/Slide";
import { NextButton } from "~/components/NextButton"; // Import the new component

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
          <Slide>
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
              <NextButton type="submit">
                Next
              </NextButton>
            </form>
          </Slide>

          {/* Slide 2: User List */}
          <Slide>
            <UserList />
            <div class="mt-4 flex justify-between">
              <button 
                class="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition hover:bg-gray-400"
                onClick={() => {
                  // Handle back logic if needed
                }}>
                Back
              </button>
              <NextButton>
                Next
              </NextButton>
            </div>
          </Slide>

          {/* Slide 3 */}
          <Slide>
            <p class="text-3xl font-bold">Slide 3</p>
          </Slide>

          {/* Slide 4 */}
          <Slide>
            <p class="text-3xl font-bold">Slide 4</p>
          </Slide>
        </Slider>
      </div>
    </main>
  );
}