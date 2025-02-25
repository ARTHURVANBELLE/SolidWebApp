// TeamDropdown.tsx
import { createSignal, onMount } from "solid-js";

type Team = {
  id: number;
  name: string;
};

// Server action to fetch teams
async function getTeams() {
  "use server";
  
  // Import PrismaClient only on the server
  const { PrismaClient } = await import('@prisma/client');
  const db = new PrismaClient();
  
  try {
    const teams = await db.team.findMany();
    return { success: true, data: teams };
  } catch (error: any) {
    console.error("Error fetching teams:", error);
    return { success: false, error: error.message };
  } finally {
    await db.$disconnect();
  }
}

export default function TeamDropdown() {
  const [selectedId, setSelectedId] = createSignal<number | null>(null);
  const [teams, setTeams] = createSignal<Team[]>([]);
  const [isOpen, setIsOpen] = createSignal(false);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen());

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      setIsOpen(false);
    }
  };

  // Add event listener for outside clicks
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });

  // Fetch teams using the server action
  onMount(async () => {
    setLoading(true);
    try {
      const result = await getTeams();
      if (result.success) {
        if (result.data) {
          setTeams(result.data);
        }
      } else {
        setError(`Failed to load teams: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      setError(`Failed to load teams: ${error.message}`);
    } finally {
      setLoading(false);
    }
  });

  return (
    <div class="relative dropdown-container">
      <button 
        class="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-between w-48"
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
      >
        <span>
          {selectedId() 
            ? teams().find((t: Team) => t.id === selectedId())?.name
            : "Select Team"}
        </span>
        <span class="ml-2">▼</span>
      </button>
      
      {isOpen() && (
        <ul class="absolute w-full bg-white border rounded mt-1 shadow-lg max-h-60 overflow-y-auto z-10">
          {loading() ? (
            <li class="px-4 py-2 text-gray-500">Loading teams...</li>
          ) : error() ? (
            <li class="px-4 py-2 text-red-500">{error()}</li>
          ) : teams().length > 0 ? (
            teams().map((team: Team) => (
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
            ))
          ) : (
            <li class="px-4 py-2 text-gray-500">No teams available</li>
          )}
        </ul>
      )}
    </div>
  );
}