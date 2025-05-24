import { createAsyncStore, type RouteDefinition } from "@solidjs/router";
import { getTopUsers } from "~/lib/user";
import Layout from "~/components/Layout";
import RankedUsers from "~/components/User/RankedUsers";

export const route = {
  preload() {
    getTopUsers(10);
  },
} satisfies RouteDefinition;

export default function Ranking() {
  // Using createAsyncStore with optimistic updates
  const topUsers = createAsyncStore(() => getTopUsers(10), {
    initialValue: [],
  });

  return (
    <Layout protected={true}>
      <RankedUsers topUsers={topUsers()} />
    </Layout>
  );
}