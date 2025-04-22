import { createSignal, createEffect, For } from "solid-js";
import { updateUserAction, getUserById } from "~/lib/user";
import {TextInput} from "~/components/TextInput";
import TeamSelect from "../Team/TeamSelect";
import { getSession } from "~/utils/session";


var userData: {
    stravaId: number;
    firstName: string;
    lastName: string;
    email: string | null;
    password: string;
    teamId: number | null;
    imageUrl: string | null;
    isAdmin: boolean | null;
}[]

export default function EditProfile() {
  const [user, setUser] = createSignal(userData);
  const [currentPage, setCurrentPage] = createSignal();
  const usersPerPage = 20;

  // Fetch users when component mounts
  createEffect(async () => {
    const session = await getSession();
    if (!session.id) {
      console.error("No session ID found");
      return;
    }
    const currentUser = await getUserById(parseInt(session.id));
    if (!currentUser) {
      console.error("User not found");
      return;
    }
    setUser([currentUser]);
    });

  // Handle updates instantly
  const handleUpdate = async (stravaId: number, field: string, value: string | number | null) => {
    setUser(user().map(user => user.stravaId === stravaId ? { ...user, [field]: value } : user));
    const formData = new FormData();
    formData.append(field, value?.toString() ?? '');
    await updateUserAction(formData);
  };

  return (
    <main class="flex flex-col items-center p-6">
      <h1 class="text-3xl font-bold text-sky-700 mb-6">User Management</h1>
      
      <div class="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b">
              <th class="p-2">First Name</th>
              <th class="p-2">Last Name</th>
              <th class="p-2">Email</th>
              <th class="p-2">Team</th>
            </tr>
          </thead>
          <tbody>
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
                <TeamSelect name="team"></TeamSelect>
              </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
