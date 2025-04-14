import { createSignal, createEffect, For } from "solid-js";
import { updateUserAction, getUsers } from "~/lib/user";
import {TextInput} from "~/components/TextInput";

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
    await updateUserAction({ [field]: value });
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
                  <TextInput value={user.firstName} onInput={(e) => handleUpdate(user.id, "firstName", e.target.value)} />
                </td>
                <td class="p-2">
                  <TextInput value={user.lastName} onInput={(e) => handleUpdate(user.id, "lastName", e.target.value)} />
                </td>
                <td class="p-2">
                  <TextInput value={user.email} onInput={(e) => handleUpdate(user.id, "email", e.target.value)} />
                </td>
                <td class="p-2">
                  <TextInput value={user.team} onInput={(e) => handleUpdate(user.id, "team", e.target.value)} />
                </td>
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
