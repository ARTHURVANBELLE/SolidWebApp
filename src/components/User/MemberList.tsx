import { createSignal, For, createResource } from "solid-js";
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

export default function UserList() {
  const [teamsData] = createResource(getTeams);

  return (
    <div>
      <h2 class="text-xl font-bold">Cyclist Selection</h2>
      {teamsData.loading ? (
        <p>Loading teams...</p>
      ) : (
        <ul>
          <For each={teamsData()}>
            {(team) => (
              <li class="border p-2 my-2 rounded">
                <h3 class="text-lg font-semibold">Team {team.name}</h3>
                <ul class="ml-4">
                  <For each={team.users}>
                    {(user) => (
                      <li class="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="users"
                          id={`user-${user.stravaId}`}
                          value={user.stravaId}
                          disabled={!user.stravaId}
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
      )}
    </div>
  );
}
