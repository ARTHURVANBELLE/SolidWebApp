import Layout from "~/components/Layout";
import EditProfile from "~/components/User/EditProfile";

export default function Profile() {
  return (
    <Layout protected={true}>
      <main class="flex flex-col min-h-full w-full">
        <h1 class="text-3xl sm:text-4xl md:text-5xl text-blue-500 font-bold my-6 sm:my-8 text-center">
          Edit Profile
        </h1>
        <div class="w-full max-w-7xl mx-auto px-4">
          <EditProfile />
        </div>
      </main>
    </Layout>
  );
}
