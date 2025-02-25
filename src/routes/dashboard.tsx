import { TextInput } from "~/components/TextInput";
import { addUserAction } from "~/lib/users";
import NewMember from "~/components/MemberCreation";
import NewTeam from "~/components/TeamCreation";

export default function NewActivity() {
  return (
    <div class="flex flex-row items-center justify-center gap-x-8 w-full">
          <NewMember />
          <NewTeam />
    </div>
  );
}
