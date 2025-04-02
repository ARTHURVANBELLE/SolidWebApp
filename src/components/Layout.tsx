import { JSXElement, Show } from "solid-js";
import Nav from "./Nav";
import { createAsync, Navigate, redirect } from "@solidjs/router";
import { getUser } from "~/utils/session";

export default function Layout(props: {
  children: JSXElement;
  protected?: boolean;
}) {
  const user = createAsync(() => getUser());
  return (
    <>
      <Nav />
      <main>
        <Show
          when={!props.protected || user()}
          fallback={Navigate({ href: "/login" })}
        >
          {props.children}
        </Show>
      </main>
    </>
  );
}
