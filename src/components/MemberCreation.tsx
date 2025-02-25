import { TextInput } from "~/components/TextInput";
import { addUserAction } from "~/lib/users";

export default function NewMember() {
  return (
    <main class="flex flex-col items-center justify-center min-h-fit">
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8">
        Create a New User
      </h1>

      {/* Form Container */}
      <div class="bg-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <form method="post" action={addUserAction} class="flex flex-col gap-4">
          <TextInput
            name="firstName"
            type="text"
            placeholder="first name"
            required
          />
          <TextInput
            name="lastName"
            type="text"
            placeholder="last name"
            required
          />
          <TextInput name="email" type="email" placeholder="mail" required />
          <TextInput
            name="password"
            type="password"
            placeholder="password"
            required
          />
          <TextInput name="team" type="text" placeholder="Team" required />

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
