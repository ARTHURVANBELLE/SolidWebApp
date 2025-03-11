import { TextInput } from "~/components/TextInput";
import { addUserAction } from "~/lib/user";
import { createSelector, createSignal, Show } from "solid-js";
import TeamSelect from "~/components/TeamSelect";
import { useSubmission } from "@solidjs/router";
import SubmitButton from "./SubmitButton";

export default function NewMember() {
  const [selectedId, setSelectedId] = createSignal();
  const isSelected = createSelector(selectedId);
  
  // Use the useSubmission hook to track the form submission state
  const addUserSubmission = useSubmission(addUserAction);

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
            disabled={addUserSubmission.pending}
          />
          <TextInput
            name="lastName"
            type="text"
            placeholder="last name"
            required
            disabled={addUserSubmission.pending}
          />
          <TextInput 
            name="email" 
            type="email" 
            placeholder="mail" 
            required 
            disabled={addUserSubmission.pending}
          />
          <TextInput
            name="password"
            type="password"
            placeholder="password"
            required
            disabled={addUserSubmission.pending}
          />
          <TeamSelect 
            name="teamId" 
            required
            disabled={addUserSubmission.pending}
          />

          {/* Submit Button with Loading State */}
          <SubmitButton
            pending={addUserSubmission.pending}
            text="Submit" 
            processingText="Processing..."
          />
          
          {/* Error Message */}
          <Show when={addUserSubmission.error}>
            <p class="text-red-500 text-sm mt-2">
              {addUserSubmission.error?.message || "An error occurred while submitting the form"}
            </p>
          </Show>
        </form>
      </div>
    </main>
  );
}