// TeamSelect.tsx
import { createAsyncStore, query } from "@solidjs/router";
import { createSignal, onCleanup, onMount, Show, Suspense } from "solid-js";
import { db } from "~/lib/db";

type Team = {
  id: number;
  name: string;
};

type TeamSelectProps = {
  name?: string; // Make name optional with default value
  required?: boolean;
  defaultValue?: number;
  disabled?: boolean;
  class?: string;
};

// Server action to fetch teams
const getTeams = query(async function () {
  "use server";
  return await db.team.findMany();
}, "getTeams");

export default function TeamSelect(props: TeamSelectProps) {
  const [selectedId, setSelectedId] = createSignal<number | null>(
    props.defaultValue || null
  );
  const teams = createAsyncStore(() => getTeams());
  const [isOpen, setIsOpen] = createSignal(false);

  // Use "teamId" as default name if none provided
  const inputName = () => props.name || "teamId";

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen());

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".team-dropdown-container")) {
      setIsOpen(false);
    }
  };

  // Add event listener for outside clicks
  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    onCleanup(() => document.removeEventListener("click", handleClickOutside));
  });

  return (
    <div class={`relative team-dropdown-container ${props.class || ''}`}>
      {/* Hidden input field with correct name for form submission */}
      <input
        type="hidden"
        name={inputName()}
        value={selectedId() || ""}
        required={props.required}
        disabled={props.disabled}
      />

      <button
        type="button" // Important: use type="button" to prevent form submission on click
        class="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-between w-full"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
        disabled={props.disabled}
      >
        <span>
          {selectedId()
            ? teams()?.find((t: Team) => t.id === selectedId())?.name
            : "Select Team"}
        </span>
        <span class="ml-2">▼</span>
      </button>

      {isOpen() && (
        <ul class="absolute w-full bg-white border rounded mt-1 shadow-lg max-h-60 overflow-y-auto z-10">
          <Suspense fallback={<p>Loading teams...</p>}>
            <Show when={teams()} fallback={<p>No teams available</p>}>
              {teams()?.map((team: Team) => (
                <li
                  class="px-4 py-2 cursor-pointer hover:bg-gray-200"
                  classList={{ "bg-blue-100": selectedId() === team.id }}
                  onClick={() => {
                    setSelectedId(team.id);
                    setIsOpen(false);
                  }}
                >
                  {team.name}
                </li>
              ))}
            </Show>
          </Suspense>
        </ul>
      )}

      {/* Validation message */}
      {props.required && !selectedId() && (
        <p class="text-xs text-red-500 mt-1">Please select a team</p>
      )}
    </div>
  );
}
