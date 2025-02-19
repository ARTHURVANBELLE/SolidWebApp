import { TextInput } from "~/components/TextInput";
import { addActivityAction } from "~/lib/activity";

export default function NewActivity() {
  return (
    <main class="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8">Create a New Activity</h1>

      {/* Form Container */}
      <div class="bg-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <form method="post" action={addActivityAction} class="flex flex-col gap-4">
          <TextInput
            name="title"
            type="text"
            placeholder="Enter activity title"
            required={true}
          />

          {/* Submit Button */}
          <input
            type="submit"
            value="Submit"
            class="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          />
        </form>
      </div>
    </main>
  );
}
