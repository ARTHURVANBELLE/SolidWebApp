import { createSignal, createEffect, For } from "solid-js";
import { getTeams } from "~/lib/team";
import { getUsersByTeam, getUsers } from "~/lib/user";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  teamId: number;
};

type Team = {
  id: number;
  name: string;
};

type TeamWithUsers = Team & { users: User[] };

export default function UserList() {
  const [teamsWithUsers, setTeamsWithUsers] = createSignal<TeamWithUsers[]>([]);
  const [selectedUserIds, setSelectedUserIds] = createSignal<number[]>([]);

  createEffect(async () => {
    try {
      const dataTeams = await getTeams();
      const dataUsers = await getUsers();

      const groupedTeams = dataTeams.map((team: Team) => ({
        ...team,
        users: dataUsers.filter((user: User) => user.teamId === team.id),
      }));

      setTeamsWithUsers(groupedTeams);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  return (
    <div>
      <h2 class="text-xl font-bold">Cyclist Selection</h2>
      <ul>
        <For each={teamsWithUsers()}>
          {(team) => (
            <li class="border p-2 my-2 rounded">
              <h3 class="text-lg font-semibold">{team.name}</h3>
              <ul class="ml-4">
                <For each={team.users}>
                  {(user) => (
                    <li class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUserIds().includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                      <label for={`user-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </label>
                    </li>
                  )}
                </For>
              </ul>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
