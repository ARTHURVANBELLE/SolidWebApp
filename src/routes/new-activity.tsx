import { createSignal } from "solid-js";
import { TextInput } from "~/components/TextInput";

export default function NewActivity() {
  const [title, setTitle] = createSignal("");
  const [error, setError] = createSignal("");

  const handleInput = (event: InputEvent) => {
    setTitle((event.target as HTMLInputElement).value);
    if ((event.target as HTMLInputElement).value.length < 3) {
      setError("Title must be at least 3 characters long");
    } else {
      setError("");
    }
  };

  let inputRef: HTMLInputElement | undefined;

  return (
    <main class="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8">Create a New Activity</h1>

      {/* Form Container */}
      <div class="bg-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <form onSubmit={(e) => e.preventDefault()} class="flex flex-col gap-4">
          <TextInput
            name="activityTitle"
            type="text"
            label="Your Title"
            placeholder="Enter activity title"
            value={title()}
            error={error()}
            required={true}
            ref={(el) => (inputRef = el)}
            onInput={handleInput}
            onChange={() => {}}
            onBlur={() => {}}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!!error()}
            class="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
