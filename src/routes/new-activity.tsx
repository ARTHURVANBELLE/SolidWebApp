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

      <div class="max-w-4xl mx-auto p-4">
        <Slider>
          <div class="keen-slider__slide bg-blue-100 h-64 flex items-center justify-center">
            <div class="bg-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-md">
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
