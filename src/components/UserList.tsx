import { createSignal, createEffect, For } from "solid-js";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  team: string;
};

export default function UserList() {
  const [users, setUsers] = createSignal<User[]>([]);

  createEffect(async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  });

  return (
    <div>
      <h2 class="text-xl font-bold">User List</h2>
      <ul>
        <For each={users()}>
          {(user, index) => (
            <li class="border p-2 my-2 rounded">
              {user.firstName} {user.lastName} - {user.email}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
