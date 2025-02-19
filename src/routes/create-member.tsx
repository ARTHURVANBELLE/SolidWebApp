import { createSignal } from "solid-js";
import { TextInput } from "~/components/TextInput";
import { useNavigate } from "@solidjs/router";
import { addUser } from "~/lib/users";

export default function NewActivity() {
  const [name, setName] = createSignal("");
  const [lastName, setLastName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const [errorName, setErrorName] = createSignal("");
  const [errorLastName, setErrorLastName] = createSignal("");
  const [errorEmail, setErrorEmail] = createSignal("");
  const [errorPassword, setErrorPassword] = createSignal("");

  const [success, setSuccess] = createSignal("");
  const [error, setError] = createSignal("");

  const navigate = useNavigate();

  const handleInput =
    (
      setter: (value: string) => void,
      setError: (error: string) => void,
      minLength: number
    ) =>
    (event: InputEvent) => {
      const value = (event.target as HTMLInputElement).value;
      setter(value);

      if (value.length < minLength) {
        setError(`Value must be at least ${minLength} characters long`);
      } else {
        setError("");
      }
    };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: name(),
          lastName: lastName(),
          email: email(),
          password: password(),
        }),
      });
      const user = await addUser({})

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess("User created successfully!");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  let inputRef: HTMLInputElement | undefined;

  return (
    <main class="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 class="text-5xl text-sky-700 font-bold uppercase my-8">
        Create a New User
      </h1>

      {/* Form Container */}
      <div class="bg-gray-100 shadow-lg rounded-2xl p-8 w-full max-w-md">
        <form onSubmit={(e) => e.preventDefault()} class="flex flex-col gap-4">
          <TextInput
            name="name"
            type="text"
            label="User Name"
            placeholder="Name"
            value={name()}
            error={errorName()}
            required={true}
            ref={(el) => (inputRef = el)}
            onInput={handleInput(name, setErrorName, 3)}
            onChange={() => {}}
            onBlur={() => {}}
          />
          <TextInput
            name="lastName"
            type="text"
            label="User LastName"
            placeholder="LastName"
            value={lastName()}
            error={errorLastName()}
            required={true}
            ref={(el) => (inputRef = el)}
            onInput={handleInput(lastName, setErrorLastName, 3)}
            onChange={() => {}}
            onBlur={() => {}}
          />
          <TextInput
            name="email"
            type="email"
            label="mail"
            placeholder="mail"
            value={email()}
            error={errorEmail()}
            required={true}
            ref={(el) => (inputRef = el)}
            onInput={handleInput(name, setErrorEmail, 3)}
            onChange={() => {}}
            onBlur={() => {}}
          />
          <TextInput
            name="password"
            type="password"
            label="password"
            placeholder="password"
            value={password()}
            error={errorPassword()}
            required={true}
            ref={(el) => (inputRef = el)}
            onInput={handleInput(name, setErrorPassword, 3)}
            onChange={() => {}}
            onBlur={() => {}}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !!errorName() ||
              !!errorLastName() ||
              !!errorEmail() ||
              !!errorPassword()
            }
            onClick={handleSubmit}
            class="bg-blue-500 text-white px-4 py-2 rounded"
          >
            class="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg
            transition hover:bg-red-600 disabled:bg-gray-300
            disabled:cursor-not-allowed" Submit
          </button>
        </form>
      </div>
    </main>
  );
}
