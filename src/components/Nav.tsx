import { useLocation, useNavigate } from "@solidjs/router";
import { NavLink } from "./Navlink";
import { Show, createSignal } from "solid-js";
import { createAsync } from "@solidjs/router";
import { getUser, logout } from "~/utils/session";
import logo from "~/assets/image/image.png";

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = createAsync(() => getUser());
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const handleLogout = async () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen());
  };

  return (
    <nav class="bg-white shadow-md border-b-2 border-red-600 sticky top-0 z-50">
      <div class="max-w-full mx-auto px-6 sm:px-8 lg:px-10">
        <div class="flex justify-between h-20">
          <div class="flex items-center flex-grow">
            <div class="flex-shrink-0 flex items-center">
              <img
                src={logo}
                alt="Cyclo Blanmont Logo"
                class="h-14 w-14 mr-4 rounded-full object-cover border-2 border-red-600 shadow-md" /* Increased size and margin */
              />
              <span class="font-bold text-2xl text-gray-900">
                {" "}
                {/* Increased text size */}
                Cyclo Blanmont
              </span>
            </div>

            {/* Desktop navigation */}
        <div class="hidden md:flex md:space-x-8 md:flex-grow md:justify-center"> {/* Added flex-grow, justify-center, and increased space-x */}
              {" "}
              {/* Increased margin and spacing */}
              <NavLink
                href="/"
                class="px-4 py-3 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition text-base" /* Increased padding and font size */
                activeClass="border-b-3 border-red-600 text-red-600 font-semibold"
              >
                Home
              </NavLink>
              <NavLink
                href="/news"
                class="px-4 py-3 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition text-base"
                activeClass="border-b-3 border-red-600 text-red-600 font-semibold"
              >
                News
              </NavLink>
              <NavLink
                href="/new-activity"
                class="px-4 py-3 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition text-base"
                activeClass="border-b-3 border-red-600 text-red-600 font-semibold"
              >
                New Activity
              </NavLink>
              <NavLink
                href="/ranking"
                class="px-4 py-3 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition text-base"
                activeClass="border-b-3 border-red-600 text-red-600 font-semibold"
              >
                Ranking
              </NavLink>
              <NavLink
                href="/profile"
                class="px-4 py-3 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition text-base"
                activeClass="border-b-3 border-red-600 text-red-600 font-semibold"
              >
                My Profile
              </NavLink>
            </div>
          </div>
          {/* User navigation */}
          <div class="hidden md:flex items-center">
            <Show when={user()?.isAdmin}>
              <NavLink
                href="/dashboard"
                class="px-4 py-3 text-gray-800 font-medium rounded-md mr-5 hover:bg-gray-100 transition text-base" /* Increased padding and spacing */
                activeClass="border-b-3 border-red-600 text-red-600 font-semibold"
              >
                Admin Dashboard
              </NavLink>
            </Show>

            {/* User menu */}
            <div class="ml-4 relative flex items-center space-x-5">
              {" "}
              {/* Increased spacing */}
              <Show when={user()}>
                <div class="flex items-center space-x-3">
                  {" "}
                  {/* Increased spacing */}
                  <div class="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    {" "}
                    {/* Increased avatar size */}
                    <Show
                      when={user()?.imageUrl}
                      fallback={
                        <div class="h-full w-full flex items-center justify-center bg-gray-300">
                          <span class="text-gray-600 text-sm">
                            {" "}
                            {/* Increased text size */}
                            {user()?.firstName?.charAt(0)}
                            {user()?.lastName?.charAt(0)}
                          </span>
                        </div>
                      }
                    >
                      <img
                        src={user()?.imageUrl ?? undefined}
                        alt="Profile"
                        class="h-full w-full object-cover"
                      />
                    </Show>
                  </div>
                  <span class="text-gray-800 font-medium text-base">
                    {" "}
                    {/* Increased text size */}
                    {user()?.firstName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  class="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-base" /* Increased padding and text size */
                >
                  Logout
                </button>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
