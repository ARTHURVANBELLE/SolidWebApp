import { TextInput } from "~/components/TextInput";
import { addUserAction } from "~/lib/user";
import NewMember from "~/components/User/MemberCreation";
import NewTeam from "~/components/Team/TeamCreation";
import Layout from "~/components/Layout";

export default function NewActivity() {
  return (
    <Layout protected={true}>
      <div class="flex flex-row items-center justify-center gap-x-8 w-full">
        <NewMember />
        <NewTeam />
      </div>
    </Layout>
  );
}
