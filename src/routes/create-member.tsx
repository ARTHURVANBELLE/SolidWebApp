import { createSignal } from "solid-js";
import { TextInput } from "~/components/TextInput";
import { useNavigate } from "@solidjs/router";
import { addUserAction } from "~/lib/users";

export default function NewActivity() {
  return (
    <main class="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8">
        Create a New User
      </h1>

      {/* Form Container */}
      <div class="bg-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <form method="post" action={addUserAction} class="flex flex-col gap-4">
          <TextInput
            name="firstName"
            type="text"
            placeholder="firstName"
            required
          />
          <TextInput
            name="lastName"
            type="text"
            placeholder="lastName"
            required
          />
          <TextInput name="email" type="email" placeholder="mail" required />
          <TextInput
            name="password"
            type="password"
            placeholder="password"
            required
          />
          <TextInput
            name="team"
            type="text"
            placeholder="team"
            required
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
    </main>
  );
}
