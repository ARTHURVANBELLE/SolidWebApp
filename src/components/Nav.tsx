import { useLocation, useNavigate } from "@solidjs/router";
import {NavLink} from "./Navlink";
import { Show } from "solid-js";
import { createAsync } from "@solidjs/router";
import { getUser, logout } from "~/utils/session";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = createAsync(() => getUser());
  const active = (path: string) =>
    path == location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600";
  
  const handleLogout = async () => {
    logout();
    navigate("/login");
  };

  return (
  <nav class="flex justify-between items-center w-full p-4 bg-red-500">
    <ul class="flex">
        <NavLink href="/">Home</NavLink>
        <NavLink href="/new-activity">New Activity</NavLink>
        <NavLink href="/profile">My Profile</NavLink>
      </ul>

      <ul class="flex">
        <Show when={user()?.isAdmin}>
          <NavLink href="/dashboard">Admin</NavLink>
        </Show>
        <li class="border-b-2 border-transparent hover:border-sky-600 px-4 py-2">
          <a href="#" onClick={handleLogout}>Logout</a>
        </li>
      </ul>
    </nav>
  );
}

