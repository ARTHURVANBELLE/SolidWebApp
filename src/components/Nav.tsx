import { useLocation } from "@solidjs/router";
import {NavLink} from "./Navlink";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600";
  return (
  <nav class="flex justify-between items-center w-full p-4 bg-red-500">
    <ul class="flex">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/new-activity">New Activity</NavLink>
        <NavLink href="/profile">My Profile</NavLink>
      </ul>

      <ul class="flex">
        <NavLink href="/admin">Admin</NavLink>
      </ul>
    </nav>
  );
}

