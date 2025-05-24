import { createSignal, For, Show, onMount, onCleanup } from "solid-js";
import { NextButton } from "../NextButton";
import { getTeams } from "~/lib/team"; // Assuming you have a function to fetch teams
import { createAsyncStore, type RouteDefinition } from "@solidjs/router";

export const route = {
  preload() {
    getTeams();
  },
} satisfies RouteDefinition;

export default function MemberList() {
  const teamsData = createAsyncStore(() => getTeams());
  const [containerHeight, setContainerHeight] = createSignal("auto");
  const [expandedTeams, setExpandedTeams] = createSignal<
    Record<string, boolean>
  >({});

  // Toggle team expansion
  const toggleTeam = (teamId: number) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // Check if team is expanded
  const isTeamExpanded = (teamId: number) => {
    return expandedTeams()[teamId] !== false; // Default to expanded
  };

  // Calculate maximum height on mount to ensure component doesn't overflow
  onMount(() => {
    const updateHeight = () => {
      const maxHeight = window.innerHeight - 400; // Adjust this value as needed
      setContainerHeight(`${maxHeight}px`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    onCleanup(() => {
      window.removeEventListener("resize", updateHeight);
    });
  });

  return (
    <div class="member-list flex flex-col items-center w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
      <h2 class="text-3xl font-bold text-sky-700 mb-2 text-center">
        Select Participants
      </h2>

      <div class="w-full max-h-[calc(100vh-320px)] overflow-y-auto pr-1 space-y-4">
        <For each={teamsData()}>
          {(team) => (
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div
                class="bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-3.5 flex items-center cursor-pointer w-full"
                onClick={() => toggleTeam(team.id)}
              >
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-white">
                    Team {team.name}
                  </h3>
                </div>
                <div class="flex items-center">
                  <span class="text-white text-sm font-medium mr-3">
                    {team.users.length} member{team.users.length !== 1 ? "s" : ""}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`h-5 w-5 text-white transition-transform duration-300 ${
                      isTeamExpanded(team.id) ? "transform rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <Show when={isTeamExpanded(team.id)}>
                <ul class="divide-y divide-gray-100">
                  <For each={team.users}>
                    {(user) => (
                      <li class="px-6 py-3 hover:bg-gray-50 transition-colors duration-150">
                        <div class="flex items-center">
                          <input
                            type="checkbox"
                            name="users"
                            id={`user-${user.stravaId}`}
                            value={user.stravaId}
                            disabled={!user.stravaId}
                            class="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          />
                          <label
                            for={`user-${user.stravaId}`}
                            class="ml-4 flex-1 font-medium text-gray-700 cursor-pointer flex items-center"
                          >
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={`${user.firstName} ${user.lastName}`}
                                class="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200"
                              />
                            ) : (
                              <div class="w-10 h-10 rounded-full mr-3 bg-sky-100 flex items-center justify-center text-sky-600 font-semibold">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </div>
                            )}
                            <span class="text-base">
                              {user.firstName} {user.lastName}
                            </span>
                          </label>
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              </Show>
            </div>
          )}
        </For>
      </div>

      <div class="mt-8 flex justify-center w-full">
        <NextButton
          type="button"
          class="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-10 py-3.5 rounded-lg font-medium shadow-md hover:from-sky-600 hover:to-blue-700 transition-all duration-200 flex items-center"
        >
          <span>Continue to Strava Activity</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 ml-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </NextButton>
      </div>
    </div>
  );
}
