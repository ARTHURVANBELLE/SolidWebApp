// src/root.tsx or your main layout file
/*
import { Suspense } from "solid-js";
import { Router } from "@solidjs/router";
import ErrorBoundary from "./components/ErrorBoundary";
import Debug from "./components/Debug";
import { getLoginUrl } from "./utils/session";

export default function App() {
  return (
    <Router>
        <Suspense fallback={<p>Loading...</p>}>
          {import.meta.env.DEV && <Debug />}
        </Suspense>
    </Router>
  );
}

*/
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";

export default function App() {
  return (
    <Router
      root={props => (
        <>
          <Nav />
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}



/*
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import Nav from "~/components/Nav";
import "./app.css";

export default function App() {
  return (
    <Router>
      <>
        <Nav />
        <Suspense>
          <FileRoutes />
        </Suspense>
      </>
    </Router>
  );
}



import { Router } from "@solidjs/router";
//import { FileRoutes } from "@solidjs/start";
import Nav from "./components/Nav";
import FileRoutes from "./routes";

export default function App() {
  return (
    <Router>
      <div>
        <Nav />
        <main>
          <FileRoutes />
        </main>
      </div>
    </Router>
  );
}

*/
