import { createSignal, For, createResource, Show, onMount, onCleanup } from "solid-js";
import { db } from "~/lib/db";

type User = {
  stravaId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  password: string;
  teamId: number | null;
  imageUrl: string | null;
  isAdmin: boolean | null;
};

const getTeams = async () => {
  "use server";
  const res = await db.team.findMany({
    include: {
      users: true,
    },
  });
  return res;
};

export default function MemberList() {
  const [teamsData] = createResource(getTeams);
  const [containerHeight, setContainerHeight] = createSignal("auto");

  // Calculate maximum height on mount to ensure component doesn't overflow
  onMount(() => {
    const updateHeight = () => {
      // Calculate a reasonable height that doesn't cause page overflow
      // Subtract space for headings, buttons, and margins
      const maxHeight = window.innerHeight - 350;  // Adjust this value as needed
      setContainerHeight(`${maxHeight}px`);
    };
    
    updateHeight();
    window.addEventListener("resize", updateHeight);
    
    onCleanup(() => {
      window.removeEventListener("resize", updateHeight);
    });
  });

  return (
    <div class="member-list">
      <Show when={teamsData.loading} fallback={
        <div class="space-y-4" style={{
          "max-height": containerHeight(), 
          "overflow-y": "auto",
          "padding-right": "8px"
        }}>
          <For each={teamsData()}>
            {(team) => (
              <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div class="bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3">
                  <h3 class="text-lg font-semibold text-white">Team {team.name}</h3>
                </div>
                <ul class="divide-y divide-gray-100">
                  <For each={team.users}>
                    {(user) => (
                      <li class="p-3 hover:bg-gray-50 transition-colors duration-150">
                        <div class="flex items-center">
                          <input
                            type="checkbox"
                            name="users"
                            id={`user-${user.stravaId}`}
                            value={user.stravaId}
                            disabled={!user.stravaId}
                            class="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          />
                          <label for={`user-${user.stravaId}`} class="ml-3 font-medium text-gray-700 cursor-pointer flex items-center">
                            {user.imageUrl && (
                              <img 
                                src={user.imageUrl} 
                                alt={`${user.firstName} ${user.lastName}`}
                                class="w-8 h-8 rounded-full mr-3 object-cover border border-gray-200" 
                              />
                            )}
                            {!user.imageUrl && (
                              <div class="w-8 h-8 rounded-full mr-3 bg-sky-100 flex items-center justify-center text-sky-600">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                            )}
                            {user.firstName} {user.lastName}
                          </label>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            )}
          </For>
        </div>
      }>
        <div class="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
          <div class="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div class="space-y-4">
            {[1, 2].map(() => (
              <div>
                <div class="h-10 bg-gray-200 rounded mb-4"></div>
                <div class="pl-4 space-y-3">
                  {[1, 2, 3].map(() => (
                    <div class="h-6 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Show>
    </div>
  );
}
