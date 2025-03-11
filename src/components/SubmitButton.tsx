import { Show } from "solid-js";

interface SubmitButtonProps {
    pending?: boolean;
    text?: string;
    processingText?: string;
    bgColor?: string;
    hoverColor?: string;
    type?: "submit" | "button" | "reset";
    onClick?: (event: MouseEvent) => void;
    class?: string;
}

export default function SubmitButton(props: SubmitButtonProps) {
    const {
        pending = false,
        text = "Submit",
        processingText = "Processing...",
        bgColor = "bg-red-500",
        hoverColor = "hover:bg-red-600",
        type = "submit",
        onClick,
        class: customClass = "",
    } = props;

    return (
        <button
            type={type}
            disabled={pending}
            onClick={onClick}
            class={`${bgColor} text-white font-semibold py-2 px-4 rounded-lg transition ${hoverColor} disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center ${customClass}`}
        >
            <Show
                when={!pending}
                fallback={
                    <div class="flex items-center">
                        <svg
                            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                            ></circle>
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        {processingText}
                    </div>
                }
            >
                {text}
            </Show>
        </button>
    );
}