import { TextInput } from "~/components/TextInput";
import { addUserAction } from "~/lib/users";
import { createSelector, createSignal, Show } from "solid-js";
import TeamSelect from "~/components/TeamSelect";
import { useSubmission } from "@solidjs/router";

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
          <button
            type="submit"
            disabled={addUserSubmission.pending}
            class="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center"
          >
            <Show 
              when={!addUserSubmission.pending} 
              fallback={
                <div class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              }
            >
              Submit
            </Show>
          </button>
          
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