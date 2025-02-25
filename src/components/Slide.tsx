import { createSignal, JSXElement } from "solid-js";

type Props = {
    children: JSXElement
}

export default function Slide(props: Props) {
    return (
        <div class="keen-slider" ref={container}>
            {props.children}
        </div>
    )
}
