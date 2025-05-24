import { For, Show, createSignal } from "solid-js";

type RankedUsersProps = {
  topUsers?: any[];
  onRefresh?: () => void;
};

export default function RankedUsers(props: RankedUsersProps) {
  const [topUsers] = createSignal(props.topUsers || []);

  return (
    <div class="max-w-4xl mx-auto p-4">
      <h1 class="text-3xl font-bold text-center mb-8 text-sky-700">
        User Rankings
      </h1>

      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Rank
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Activities
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <Show
              when={topUsers()}
              fallback={
                <tr>
                  <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              }
            >
              <For each={topUsers()}>
                {(user, index) => (
                  <tr class={index() % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {index() + 1}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <Show
                            when={user.imageUrl}
                            fallback={
                              <div class="h-full w-full rounded-full bg-gray-300 flex items-center justify-center">
                                <span class="text-gray-600">
                                  {user.firstName?.charAt(0)}
                                  {user.lastName?.charAt(0)}
                                </span>
                              </div>
                            }
                          >
                            <img
                              class="h-10 w-10 rounded-full object-cover"
                              src={user.imageUrl || undefined}
                              alt={`${user.firstName} ${user.lastName}`}
                            />
                          </Show>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {user._count?.activities ||
                          user.activities?.length ||
                          0}
                      </div>
                    </td>
                  </tr>
                )}
              </For>
            </Show>
          </tbody>
        </table>
      </div>
    </div>
  );
}
