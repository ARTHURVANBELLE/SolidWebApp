import { Show, createResource } from "solid-js";
import { getSession } from "../utils/session";

export default function SessionDebug({ hidden = false }: { hidden?: boolean }) {
  const [sessionData] = createResource(async () => {
    const session = await getSession();
    return session.data;
  });

  return (
    <Show when={!hidden}>
      <div class="session-debug">
        <h3>Session Debug</h3>
        <Show when={sessionData.loading}>
          <p>Loading session data...</p>
        </Show>
        <Show when={sessionData.error}>
          <p class="error">Error loading session: {sessionData.error?.message}</p>
        </Show>
        <Show when={!sessionData.loading && !sessionData.error}>
          <pre>{JSON.stringify(sessionData(), null, 2)}</pre>
        </Show>
        <style>{`
          .session-debug {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            z-index: 9999;
            max-width: 400px;
            max-height: 300px;
            overflow: auto;
          }
          .session-debug pre {
            margin: 0;
            white-space: pre-wrap;
          }
          .error {
            color: #ff5555;
          }
        `}</style>
      </div>
    </Show>
  );
}
