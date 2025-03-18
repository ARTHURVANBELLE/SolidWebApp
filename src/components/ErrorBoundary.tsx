// src/components/ErrorBoundary.tsx
import { Component, createSignal, JSX } from "solid-js";

const ErrorBoundary: Component<{children: JSX.Element}> = (props) => {
  const [error, setError] = createSignal<Error | null>(null);
  
  return (
    <div>
      <ErrorCatcher onError={setError}>
        {error() ? (
          <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <h2 class="text-lg font-bold">Something went wrong</h2>
            <pre class="mt-2 p-2 bg-red-50 rounded overflow-x-auto">
              {error()?.message || "Unknown error"}
            </pre>
          </div>
        ) : (
          props.children
        )}
      </ErrorCatcher>
    </div>
  );
};

const ErrorCatcher: Component<{
  children: JSX.Element;
  onError: (error: Error) => void;
}> = (props) => {
  try {
    return <>{props.children}</>;
  } catch (e) {
    props.onError(e as Error);
    return null;
  }
};

export default ErrorBoundary;