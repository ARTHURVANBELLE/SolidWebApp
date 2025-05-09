import { A } from "@solidjs/router";
import UserList from "~/components/User/MemberList";
import Layout from "~/components/Layout";

export default function Home() {
  const handleSelectionChange = (selectedIds: number[]) => {
    // Handle the selected member IDs here
    console.log("Selected members:", selectedIds);
  };

  return (
    <Layout protected={true}>
      <main class="text-center mx-auto text-gray-700 p-4">
        <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">
          Select Members
        </h1>
        <UserList onSelectionChange={handleSelectionChange} />
      </main>
    </Layout>
  );
}
