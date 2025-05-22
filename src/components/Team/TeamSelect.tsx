// TeamSelect.tsx
import { createAsyncStore, query } from "@solidjs/router";
import { createSignal, createEffect, For } from "solid-js";
import { getTeams } from "~/lib/team";

type Team = {
  id: number;
  name: string;
};

type TeamSelectProps = {
  name?: string;
  required?: boolean;
  defaultValue?: number;
  class?: string;
};

export default function TeamSelect(props: TeamSelectProps) {
  // Initialize selectedId with props.defaultValue, ensuring proper type conversion
  const [selectedId, setSelectedId] = createSignal<number | null>(
    props.defaultValue !== undefined ? 
      (typeof props.defaultValue === 'string' ? parseInt(props.defaultValue) : props.defaultValue) : 
      null
  );
  const teams = createAsyncStore(() => getTeams());

  // Add an effect to update selectedId when defaultValue changes
  createEffect(() => {
    if (props.defaultValue !== undefined) {
      const newValue = typeof props.defaultValue === 'string' ? 
        parseInt(props.defaultValue) : props.defaultValue;
      setSelectedId(newValue);
    }
  });

  const handleChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value;
    setSelectedId(value ? parseInt(value) : null);
  };

  return (
    <div class="relative">
      <select
        name={props.name}
        required={props.required}
        class={`block w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${props.class}`}
        value={selectedId() || ""}
        onChange={handleChange}
      >
        <For each={teams()} fallback={<option disabled>Loading teams...</option>}>
          {(team: Team) => (
            <option value={team.id} selected={selectedId() === team.id}>
              {team.name}
            </option>
          )}
        </For>
      </select>
    </div>
  );
}
