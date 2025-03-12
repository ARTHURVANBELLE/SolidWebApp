import { createSignal, createEffect, For } from "solid-js";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  teamId: string;
};

type Team = {
  id: number;
  name: string;
  users: User[];
};

export default function UserList() {
  const [users, setUsers] = createSignal<User[]>([]);
  const [teams, setTeams] = createSignal<Team[]>([]);

  createEffect(async () => {
    try {
      const responseUser = await fetch("/api/user/4");
      const dataUser = await responseUser.json();
      setUsers(dataUser);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  });

  createEffect(async () => {
    try {
      const responseTeam = await fetch("/api/teams");
      const dataTeam = await responseTeam.json();
      setTeams(dataTeam);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  });


  return (
    <div>
      <h2 class="text-xl font-bold">Cyclist selection</h2>
      <ul>
        <For each={teams()}>
          {(team, index) => (
            <li class="border p-2 my-2 rounded">
              {team.name}
                <For each={team.users}>
                  {(user) => (
                    <li>
                      {user.firstName} {user.lastName}
                    </li>
                  )}
                </For>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
