import { A } from "@solidjs/router";
import Counter from "~/components/Counter";
import { TextInput } from "~/components/TextInput";
import { createSignal } from "solid-js";

export default function NewActivity() {
  const [title, setTitle] = createSignal("");
  const [error, setError] = createSignal("");

  const handleInput = (event: InputEvent) => {
    setTitle((event.target as HTMLInputElement).value);
    if ((event.target as HTMLInputElement).value.length < 3) {
      setError("Title must be at least 3 characters long");
    } else {
      setError("");
    }
  };

  let inputRef: HTMLInputElement | undefined;
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">Create a New Activity</h1>
      <form onSubmit={(e) => e.preventDefault()}>
      <TextInput
        name="username"
        type="text"
        label="Your Name"
        placeholder="Enter your name"
        value={title()}
        error={error()}
        required={true}
        ref={(el) => (inputRef = el)}
        onInput={handleInput}
        onChange={() => {}}
        onBlur={() => {}}
      />
      <button type="submit" disabled={!!error()}>
        Submit
      </button>
    </form>
    </main>
  );
}
