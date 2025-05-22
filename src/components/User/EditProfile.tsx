import { createSignal, Show, Suspense, ErrorBoundary } from "solid-js";
import { updateUserAction } from "~/lib/user";
import { TextInput } from "~/components/TextInput";
import TeamSelect from "../Team/TeamSelect";
import { getUser } from "~/utils/session";
import { createAsync } from "@solidjs/router";

// Profile form component receives the pre-fetched user data
function ProfileContent(props: { userData: any }) {
  return (
    <div class="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <div class="bg-gradient-to-r from-sky-500 to-blue-600 p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div class="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
            <Show
              when={props.userData?.imageUrl}
              fallback={
                <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              }
            >
              <img
                src={props.userData?.imageUrl || ""}
                alt="Profile"
                class="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-profile.png";
                }}
              />
            </Show>
          </div>
          <div class="text-center sm:text-left">
            <h2 class="text-xl sm:text-2xl font-bold text-white">
              {props.userData?.firstName || ""} {props.userData?.lastName || ""}
            </h2>
            <p class="text-blue-100">
              {props.userData?.email || "No email provided"}
            </p>
          </div>
        </div>
      </div>

      <form method="post" action={updateUserAction} class="p-4 sm:p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <TextInput
                name="firstName"
                type="text"
                value={props.userData?.firstName || ""}
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <TextInput
                name="lastName"
                type="text"
                value={props.userData?.lastName || ""}
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <TextInput
                name="email"
                type="email"
                value={props.userData?.email || ""}
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <TextInput
                name="password"
                type="password"
                placeholder="Leave blank to keep current password"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <p class="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Team
              </label>
              <TeamSelect
                name="teamId"
                defaultValue={props.userData?.teamId || undefined}
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Profile Image URL
              </label>
              <TextInput
                name="imageUrl"
                type="text"
                value={props.userData?.imageUrl || ""}
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end">
          <button
            type="submit"
            class="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium rounded-md shadow-md hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            Save Changes
          </button>
        </div>

        <input
          type="hidden"
          name="stravaId"
          value={props.userData?.stravaId || ""}
        />
        <input
          type="hidden"
          name="accessToken"
          value={props.userData?.accessToken || ""}
        />
      </form>
    </div>
  );
}

export default function EditProfile() {
  // Create the async resource but don't immediately access it
  const userResource = createAsync(() => getUser());

  return (
    <main class="flex flex-col items-center p-4 sm:p-6 max-w-7xl mx-auto">
      <ErrorBoundary
        fallback={(error) => (
          <div class="w-full bg-red-50 border border-red-200 p-6 rounded-lg">
            <h3 class="text-lg font-medium text-red-800 mb-2">
              Error Loading Profile
            </h3>
            <p class="text-red-600">{error.toString()}</p>
            <button
              onClick={() => window.location.reload()}
              class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
      >
        <Suspense
          fallback={
            <div class="w-full bg-white shadow-lg rounded-lg p-12 flex flex-col items-center">
              <div class="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
              <p class="text-gray-600">Loading your profile data...</p>
            </div>
          }
        >
          {/* Only access the resource inside the Suspense boundary */}
          <ProfileContent userData={userResource()} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
