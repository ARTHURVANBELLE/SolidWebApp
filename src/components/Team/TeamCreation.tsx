import { TextInput } from "~/components/TextInput";
import { addTeamAction } from "~/lib/team";
import { useSubmission } from "@solidjs/router";

export default function NewTeam() {
  const addTeamSubmission = useSubmission(addTeamAction);

  return (
    <main class="flex flex-col items-center justify-center min-h-fit">
      <h1 class="text-5xl text-red-600 font-bold my-8">Create a New Team</h1>

      {/* Form Container */}
      <div class="bg-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <form method="post" action={addTeamAction} class="flex flex-col gap-4">
          <TextInput
            name="name"
            type="text"
            placeholder="Team name"
            required
            disabled={addTeamSubmission.pending}
          />

          <button
            type="submit"
            class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Add Team
          </button>
        </form>
      </div>
    </main>
  );
}
