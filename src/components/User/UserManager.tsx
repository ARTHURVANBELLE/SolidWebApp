import { createSignal, createEffect, For } from "solid-js";
import { updateUserAction, getUsers } from "~/lib/user";
import {TextInput} from "~/components/TextInput";
import TeamSelect from "../Team/TeamSelect";

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

export default function UserManager() {
  const [users, setUsers] = createSignal<typeof userData>([]);
  const [currentPage, setCurrentPage] = createSignal(1);
  const usersPerPage = 20;

  // Fetch users when component mounts
  createEffect(async () => {
    const fetchedUsers = await getUsers();
    setUsers(fetchedUsers);
  });

  // Handle updates instantly when an admin modifies a field
  const handleUpdate = async (stravaId: number, field: string, value: string | number | null) => {
    setUsers(users().map(user => user.stravaId === stravaId ? { ...user, [field]: value } : user));
    const formData = new FormData();
    formData.append(field, value?.toString() ?? '');
    await updateUserAction(formData);
  };

  const paginatedUsers = () => {
    const start = (currentPage() - 1) * usersPerPage;
    return users().slice(start, start + usersPerPage);
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
            <For each={paginatedUsers()}>{(user) => (
              <tr class="border-b">
                <td class="p-2">
                  <TextInput name="firstName" type="text" value={user.firstName} onInput={(e) => handleUpdate(user.stravaId, "firstName", (e.target as HTMLInputElement).value)} />
                </td>
                <td class="p-2">
                  <TextInput name="lastName" type="text" value={user.lastName} onInput={(e) => handleUpdate(user.stravaId, "lastName", (e.target as HTMLInputElement).value)} />
                </td>
                <td class="p-2">
                  <TextInput name="email" type="email" value={user.email || ""} onInput={(e) => handleUpdate(user.stravaId, "email", (e.target as HTMLInputElement).value)} />
                </td>
                <TeamSelect name="team"></TeamSelect>
              </tr>
            )}</For>
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        <div class="flex justify-between mt-4">
          <button 
            class="px-4 py-2 bg-gray-300 rounded" 
            disabled={currentPage() === 1} 
            onClick={() => setCurrentPage(currentPage() - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage()}</span>
          <button 
            class="px-4 py-2 bg-gray-300 rounded" 
            disabled={currentPage() * usersPerPage >= users().length} 
            onClick={() => setCurrentPage(currentPage() + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
