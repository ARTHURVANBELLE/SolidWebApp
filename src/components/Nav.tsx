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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <img
                src={logo}
                alt="Cyclo Blanmont Logo"
                class="h-12 w-12 mr-3 rounded-full object-cover border-2 border-red-600 shadow-md"
              />
              <span class="font-bold text-xl text-gray-900">
                Cyclo Blanmont
              </span>
            </div>

            {/* Desktop navigation */}
            <div class="hidden md:ml-10 md:flex md:space-x-4">
              <NavLink
                href="/"
                class="px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition"
                activeClass="border-b-2 border-red-600 text-red-600"
              >
                Home
              </NavLink>
              <NavLink
                href="/news"
                class="px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition"
                activeClass="border-b-2 border-red-600 text-red-600"
              >
                News
              </NavLink>
              <NavLink
                href="/new-activity"
                class="px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition"
                activeClass="border-b-2 border-red-600 text-red-600"
              >
                New Activity
              </NavLink>
              <NavLink
                href="/profile"
                class="px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition"
                activeClass="border-b-2 border-red-600 text-red-600"
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
                class="px-3 py-2 text-gray-800 font-medium rounded-md mr-4 hover:bg-gray-100 transition"
                activeClass="border-b-2 border-red-600 text-red-600"
              >
                Admin Dashboard
              </NavLink>
            </Show>

            {/* User menu */}
            <div class="ml-3 relative flex items-center space-x-4">
              <Show when={user()}>
                <div class="flex items-center space-x-2">
                  <div class="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                    <Show
                      when={user()?.imageUrl}
                      fallback={
                        <div class="h-full w-full flex items-center justify-center bg-gray-300">
                          <span class="text-gray-600 text-xs">
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
                  <span class="text-gray-800 font-medium">
                    {user()?.firstName}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </Show>
            </div>
          </div>

          {/* Mobile menu button */}
          <div class="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-red-600 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class={`h-6 w-6 ${isMenuOpen() ? "hidden" : "block"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                class={`h-6 w-6 ${isMenuOpen() ? "block" : "hidden"}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div class={`md:hidden ${isMenuOpen() ? "block" : "hidden"}`}>
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <NavLink
            href="/"
            class="block px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-gray-100"
            activeClass="bg-red-100 text-red-600"
          >
            Home
          </NavLink>
          <NavLink
            href="/new-activity"
            class="block px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-gray-100"
            activeClass="bg-red-100 text-red-600"
          >
            New Activity
          </NavLink>
          <NavLink
            href="/profile"
            class="block px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-gray-100"
            activeClass="bg-red-100 text-red-600"
          >
            My Profile
          </NavLink>
          <Show when={user()?.isAdmin}>
            <NavLink
              href="/dashboard"
              class="block px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-gray-100"
              activeClass="bg-red-100 text-red-600"
            >
              Admin Dashboard
            </NavLink>
          </Show>
          <button
            onClick={handleLogout}
            class="w-full text-left block px-3 py-2 text-gray-800 font-medium rounded-md hover:bg-red-100 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
