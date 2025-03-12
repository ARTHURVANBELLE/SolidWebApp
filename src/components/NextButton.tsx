import { useSliderContext } from "~/components/Slider";

export function NextButton(props: {
  class?: string;
  type?: "button" | "submit" | "reset";
  children: any;
  form?: string;
  onClick?: (e: Event) => void;
}) {
  const { nextSlide } = useSliderContext();

  return (
    <button
      type={props.type || "button"}
      class={
        props.class ||
        "bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
      }
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(e);
        }
        nextSlide();
        //e.preventDefault();
      }}
      form={props.form}
    >
      {props.children}
    </button>
  );
}
