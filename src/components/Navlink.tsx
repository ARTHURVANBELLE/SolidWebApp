import { JSXElement } from "solid-js";
import { useLocation } from "@solidjs/router";

type NavLinkProps = {
  href: string;
  children: JSXElement;
  class?: string;
  activeClass?: string;
};

export function NavLink(props: NavLinkProps) {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname
      ? "border-sky-600"
      : "border-transparent hover:border-sky-600";
  return (
    <li class={`border-b-2 ${active(props.href)} mx-1.5 sm:mx-6`}>
      <a href={props.href}>{props.children}</a>
    </li>
  );
}
