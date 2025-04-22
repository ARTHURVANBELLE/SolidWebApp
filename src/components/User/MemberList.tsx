import { createSignal, createEffect, For } from "solid-js";
import { getTeams } from "~/lib/team";
import { getUsersByTeam, getUsers } from "~/lib/user";

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

type Team = {
  id: number;
  name: string;
};

interface UserListProps {
  onSelectionChange: (selectedIds: number[]) => void;
}

type TeamWithUsers = Team & { users: User[] };

export default function UserList(props: UserListProps) {
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
      const updated = prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId];
      props.onSelectionChange(updated); // Notify parent of the change
      return updated;
    });
  };

  return (
    <div>
      <h2 class="text-xl font-bold">Cyclist Selection</h2>
      <ul>
        <For each={teamsWithUsers()}>
          {(team) => (
            <li class="border p-2 my-2 rounded">
              <h3 class="text-lg font-semibold">Team {team.name}</h3>
              <ul class="ml-4">
                <For each={team.users}>
                  {(user) => (
                    <li class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`user-${user.stravaId}`}
                        checked={selectedUserIds().includes(user.stravaId)}
                        onChange={() => toggleUserSelection(user.stravaId)}
                      />
                      <label for={`user-${user.stravaId}`}>
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
