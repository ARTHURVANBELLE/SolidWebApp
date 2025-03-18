// src/root.tsx or your main layout file
import { Suspense } from "solid-js";
import { Router, Routes } from "@solidjs/router";
import ErrorBoundary from "./components/ErrorBoundary";
import Debug from "./components/Debug";
import { getLoginUrl } from "./utils/session";

export default function Root() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<p>Loading...</p>}>
          {import.meta.env.DEV && <Debug />}
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}