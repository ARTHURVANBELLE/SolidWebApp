import { redirect, useNavigate } from "@solidjs/router";
import { TextInput } from "~/components/TextInput";
import { addActivityAction } from "~/lib/activity";
import Slider from "~/components/Slider";

export default function NewActivity() {
  const navigate = useNavigate();
  /*
  async function handleSubmit(event: Event) {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.currentTarget as HTMLFormElement);

    try {
      await fetch(addActivityAction.toString(), {
        method: "POST",
        body: formData,
      });

      // Redirect to "member-selection" after success
      navigate("/member-selection");
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }
  */

  return (
    <main class="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8">
        Create a New Activity
      </h1>

      <div class="w-screen max-w-full h-screen p-20">
        <Slider>
          <div class="keen-slider__slide bg-blue-200 h-64 flex items-center justify-center">
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
          </div>
          <div class="keen-slider__slide bg-green-100 h-64 flex items-center justify-center">
            Slide 2
          </div>
          <div class="keen-slider__slide bg-red-100 h-64 flex items-center justify-center">
            Slide 3
          </div>
          <div class="keen-slider__slide bg-yellow-100 h-64 flex items-center justify-center">
            Slide 4
          </div>
        </Slider>
      </div>
    </main>
  );
}
