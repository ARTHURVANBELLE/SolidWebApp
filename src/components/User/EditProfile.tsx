import { createSignal, createEffect, For, Show } from "solid-js";
import { updateUserAction, getUserById } from "~/lib/user";
import {TextInput} from "~/components/TextInput";
import TeamSelect from "../Team/TeamSelect";
import { getSession, getUser } from "~/utils/session";
import { createAsync } from "@solidjs/router";

// Define the user type
type UserData = {
  stravaId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  password: string;
  teamId: number | null;
  imageUrl: string | null;
  isAdmin: boolean | null;
};

export default function EditProfile() {
  // Initialize with an empty array
  const [user, setUser] = createSignal<UserData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const usersPerPage = 20;

  // Fetch user data properly using createAsync outside of createEffect
  const userData = createAsync(() => getUser());

  // Set up user data when it's available
  createEffect(() => {
    const currentUser = userData();
    if (currentUser) {
      setUser([currentUser as UserData]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  });

  // Handle updates instantly
  const handleUpdate = async (stravaId: number, field: string, value: string | number | null) => {
    // Only update if there's data to update
    if (user().length > 0) {
      try {
        setUser(user().map(user => user.stravaId === stravaId ? { ...user, [field]: value } : user));
        const formData = new FormData();
        formData.append(field, value?.toString() ?? '');
        await updateUserAction(formData);
      } catch (e) {
        console.error(`Failed to update ${field}:`, e);
        // Optionally revert the UI change here if the server update failed
      }
    }
  };

  return (
    <main class="flex flex-col items-center p-6">
      <h1 class="text-3xl font-bold text-sky-700 mb-6">User Management</h1>
      
      <div class="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <Show when={error()} fallback={null}>
          <div class="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {error()}
          </div>
        </Show>

        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b">
              <th class="p-2">First Name</th>
              <th class="p-2">Last Name</th>
              <th class="p-2">Email</th>
              <th class="p-2">Team</th>
              <th class="p-2">Profile Picture</th>
            </tr>
          </thead>
          <tbody>
            <Show 
              when={!loading() && user().length > 0} 
              fallback={
                <tr>
                  <td colspan="5" class="p-2 text-center">
                    {loading() ? "Loading user data..." : "No user data available."}
                  </td>
                </tr>
              }
            >
              <tr class="border-b">
                <td class="p-2">
                  <TextInput name="firstName" type="text" value={user()[0].firstName} onInput={(e) => handleUpdate(user()[0].stravaId, "firstName", (e.target as HTMLInputElement).value)} />
                </td>
                <td class="p-2">
                  <TextInput name="lastName" type="text" value={user()[0].lastName} onInput={(e) => handleUpdate(user()[0].stravaId, "lastName", (e.target as HTMLInputElement).value)} />
                </td>
                <td class="p-2">
                  {/* Convert null to empty string to satisfy the type requirement */}
                  <TextInput 
                    name="email" 
                    type="email" 
                    value={user()[0].email || ''} 
                    onInput={(e) => handleUpdate(user()[0].stravaId, "email", (e.target as HTMLInputElement).value)} 
                  />
                </td>
                <td class="p-2">
                  <TeamSelect name="team" />
                </td>
              </tr>
            </Show>
          </tbody>
        </table>
      </div>
    </main>
  );
}
