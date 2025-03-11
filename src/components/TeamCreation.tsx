import { TextInput } from "~/components/TextInput";
import { addTeamAction } from "~/lib/team";
import { useSubmission } from "@solidjs/router";
import SubmitButton from "./SubmitButton";

export default function NewTeam() {
  const addTeamSubmission = useSubmission(addTeamAction);

  return (
    <main class="flex flex-col items-center justify-center min-h-fit">
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8">
        Create a New Team
      </h1>

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

          {/* Submit Button with Loading State */}
          <SubmitButton
            pending={addTeamSubmission.pending}
            text="Submit" 
            processingText="Processing..."
          />
        </form>
      </div>
    </main>
  );
}
