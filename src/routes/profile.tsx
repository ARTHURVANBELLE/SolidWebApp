import { TextInput } from "~/components/TextInput";
import { createStore } from "solid-js/store";
import Layout from "~/components/Layout";

export default function Profile() {
  const [formData, setFormData] = createStore({
    user: {
      name: "",
      email: "",
      password: "",
      teamId: "",
      pictureURL: "",
    },
  });

  return (
    <Layout protected={true}>
    <main class="flex flex-col min-h-full w-full">
      {/* Title Section at the Top */}
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8 text-center">
        Edit profile information
      </h1>

      {/* Slider takes up remaining space */}
      <div class="flex-1 w-screen max-w-full h-full">
        <form>

        </form>
      </div>
    </main>
    </Layout>
  );
}
