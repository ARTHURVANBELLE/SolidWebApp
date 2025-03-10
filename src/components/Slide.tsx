import { JSXElement } from "solid-js";

type Props = {
    children: JSXElement
    class?: string
}

export default function Slide(props: Props) {
    return (
        <div class={`keen-slider__slide ${props.class}`} classList={{'flex items-center justify-center h-full': !props.class}}>
            {props.children}
        </div>
    )
}
