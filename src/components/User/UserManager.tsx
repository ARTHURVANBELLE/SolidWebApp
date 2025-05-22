import { createSignal, For, Suspense, ErrorBoundary, onMount } from "solid-js";
import { getUsers } from "~/lib/user";
import { TextInput } from "~/components/TextInput";
import TeamSelect from "../Team/TeamSelect";
import { updateUserAction } from "~/lib/user";

// Create the specific type for users
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

// Component to render the user management UI once data is loaded
function UserTable(props: { userData: UserData[] }) {
  const [users, setUsers] = createSignal<UserData[]>(props.userData);
  const [currentPage, setCurrentPage] = createSignal(1);
  const usersPerPage = 20;

  const paginatedUsers = () => {
    const start = (currentPage() - 1) * usersPerPage;
    return users().slice(start, start + usersPerPage);
  };

  return (
    <div class="w-full max-w-6xl bg-white shadow-md rounded-lg p-6 overflow-x-auto">
      {/* Header Row */}
      <div class="grid grid-cols-6 gap-2 font-bold border-b pb-2 mb-2 min-w-[1000px]">
        <div class="p-2">First Name</div>
        <div class="p-2">Last Name</div>
        <div class="p-2">Email</div>
        <div class="p-2">Team</div>
        <div class="p-2">Admin</div>
        <div class="p-2">Actions</div>
      </div>

      {/* User Rows */}
      <For each={paginatedUsers()}>
        {(user) => (
          <form 
            method="post" 
            action={updateUserAction} 
            class="grid grid-cols-6 gap-2 border-b py-2 min-w-[1000px]"
          >
            <div class="p-2">
              <TextInput
                name="firstName"
                type="text"
                value={user.firstName}
                class="w-full"
              />
            </div>
            <div class="p-2">
              <TextInput
                name="lastName"
                type="text"
                value={user.lastName}
                class="w-full"
              />
            </div>
            <div class="p-2">
              <TextInput
                name="email"
                type="email"
                value={user.email || ""}
                class="w-full"
              />
            </div>
            <div class="p-2">
              <TeamSelect
                name="teamId"
                defaultValue={user.teamId || undefined}
                class="w-full"
              />
            </div>
            <div class="p-2 flex justify-center items-center">
              <input
                type="checkbox"
                id={`isAdmin-${user.stravaId}`}
                checked={user.isAdmin || false}
                class="w-5 h-5"
                onChange={(e) => {
                  const hiddenInput = document.getElementById(`isAdmin-hidden-${user.stravaId}`);
                  if (hiddenInput) {
                    (hiddenInput as HTMLInputElement).value = e.target.checked ? "on" : "off";
                  }
                }}
              />
            </div>
            
            <div class="p-2 flex items-center">
              {/* Hidden fields for user identity */}
              <input type="hidden" name="stravaId" value={user.stravaId} />
              <input 
                type="hidden" 
                name="isAdmin" 
                id={`isAdmin-hidden-${user.stravaId}`}
                value={user.isAdmin ? "on" : "off"} 
              />
              
              <button 
                type="submit"
                class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Update
              </button>
            </div>
          </form>
        )}
      </For>

      {/* Pagination Controls */}
      <div class="flex justify-between mt-4">
        <button
          class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage() === 1}
          onClick={() => setCurrentPage(currentPage() - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage()}</span>
        <button
          class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentPage() * usersPerPage >= users().length}
          onClick={() => setCurrentPage(currentPage() + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function UserManager() {
  const [users, setUsers] = createSignal<UserData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<Error | null>(null);
  
  // Function to load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load users on component mount
  onMount(() => {
    loadUsers();
  });
  
  return (
    <main class="flex flex-col items-center p-6 w-full">
      <h1 class="text-3xl font-bold text-red-600 mb-6">User Management</h1>

      <div class="w-full max-w-6xl flex justify-end mb-4">
        <button
          onClick={loadUsers}
          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2 transition-colors"
          disabled={loading()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading() ? "Loading..." : "Refresh Users"}
        </button>
      </div>

      {error() ? (
        <div class="w-full max-w-4xl bg-red-50 border border-red-200 p-6 rounded-lg">
          <h3 class="text-lg font-medium text-red-800 mb-2">
            Error Loading Users
          </h3>
          <p class="text-red-600">{error()?.message || "Unknown error"}</p>
          <button
            onClick={loadUsers}
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : loading() ? (
        <div class="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div class="h-10 bg-gray-200 rounded"></div>
            <div class="h-10 bg-gray-200 rounded"></div>
            <div class="h-10 bg-gray-200 rounded"></div>
            <div class="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <UserTable userData={users()} />
      )}
    </main>
  );
}
