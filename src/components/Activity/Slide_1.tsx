import DatePicker from "~/components/DatePicker/DatePicker";
import { createSignal, Show, onMount } from "solid-js";
import { NextButton } from "~/components/NextButton";

export default function Slide_1() {
  const [showDatePicker, setShowDatePicker] = createSignal(false);
  const [selectedDate, setSelectedDate] = createSignal<Date>(new Date());
  const [containerHeight, setContainerHeight] = createSignal(
    "calc(100vh - 140px)"
  );

  onMount(() => {
    const updateHeight = () => {
      setContainerHeight(`calc(100vh - 140px)`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  });

  // Format date for display
  const formattedDate = () => {
    const date = selectedDate();
    if (date) {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return "";
  };

  return (
    <div
      class="w-full h-full flex flex-col items-center justify-center px-4 py-6"
      style={`min-height: ${containerHeight()};`}
    >
      <div class="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        <h2 class="text-3xl font-bold text-sky-700 mb-6 text-center">
          Activity Details
        </h2>

        {/* Activity name with icon */}
        <div class="mb-8">
          <label
            for="activity-name"
            class="block text-gray-700 text-sm font-medium mb-2"
          >
            Activity Name
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <input
              id="activity-name"
              name="title"
              type="text"
              placeholder="e.g., Sunday Morning Ride"
              required
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Activity description with icon */}
        <div class="mb-8">
          <label
            for="activity-description"
            class="block text-gray-700 text-sm font-medium mb-2"
          >
            Activity Description
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <input
              id="activity-description"
              name="description"
              type="text"
              placeholder="e.g., A beautiful ride through the mountains"
              required
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Beautiful custom date picker */}
        <div class="mb-8">
          <label class="block text-gray-700 text-sm font-medium mb-2">
            Activity Date
          </label>
          <div class="relative">
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker())}
              class="bg-white w-full flex items-center justify-between border border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400 mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="text-gray-700">{formattedDate()}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <Show when={showDatePicker()}>
              <div class="absolute bottom-full mb-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg z-40">
                <DatePicker
                  selectedDate={selectedDate()}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />
              </div>
            </Show>

            {/* Hidden input to store the date for form submission */}
            <input
              type="hidden"
              name="date"
              value={selectedDate().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        {/* Add Next button */}
        <div class="mt-10 flex justify-end">
          <NextButton class="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow-md hover:from-sky-600 hover:to-blue-700 transition-all duration-200 flex items-center">
            <span>Continue to Participants</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 ml-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </NextButton>
        </div>
      </div>
    </div>
  );
}
