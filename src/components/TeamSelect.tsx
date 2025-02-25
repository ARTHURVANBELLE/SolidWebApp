import { createSignal, createResource } from "solid-js";

async function fetchTeams() {
  const response = await fetch("/api/teams");
  return response.json();
}

type Team = {
  id: number;
  name: string;
};

export default function TeamDropdown() {
  const [teams] = createResource(fetchTeams);
  const [selectedId, setSelectedId] = createSignal<number | null>(null);

  return (
    <div class="relative">
      <button class="bg-blue-500 text-white px-4 py-2 rounded">
        {selectedId()
          ? teams()?.find((t: Team) => t.id === selectedId())?.name
          : "Select Team"}
      </button>
      <ul class="absolute bg-white border rounded mt-2 shadow-lg">
        {teams()?.map((team: Team) => (
          <li
            class="px-4 py-2 cursor-pointer hover:bg-gray-200"
            classList={{ "bg-blue-100": selectedId() === team.id }}
            onClick={() => setSelectedId(team.id)}
          >
            {team.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
