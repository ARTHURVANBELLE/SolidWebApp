import { createSignal, JSXElement, onMount, onCleanup, createContext, useContext } from "solid-js";
import 'keen-slider/keen-slider.min.css';
import KeenSlider from 'keen-slider';

const SliderContext = createContext<{ nextSlide: () => void, prevSlide: () => void} | null>(null);

export function useSliderContext() {
  return useContext(SliderContext)!;
}

type SliderProps = {
  children: JSXElement;
}

export default function Slider(props: SliderProps) {
  let sliderContainer: HTMLDivElement | undefined;
  let sliderInstance: any = null; // Use any temporarily to avoid type issues
  const [currentSlide, setCurrentSlide] = createSignal(0);
  const [loaded, setLoaded] = createSignal(false);

  onMount(() => {
    if (!sliderContainer) return;
    
    sliderInstance = new KeenSlider(sliderContainer, {
      initial: 0,
      slideChanged(s) {
        setCurrentSlide(s.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    });
  });

  onCleanup(() => {
    if (sliderInstance) {
      sliderInstance.destroy();
    }
  });

  const nextSlide = () => {
    sliderInstance?.next();
  };

  const prevSlide = () => {
    sliderInstance?.prev();
  };

  return (
    <SliderContext.Provider value={{ nextSlide, prevSlide }}>
    <div class="relative">
      <div class="keen-slider" ref={sliderContainer}>
        {props.children}
      </div>

      {loaded() && (
        <>
          <button
            class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          
          <button
            class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-md hover:bg-white"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </>
      )}
    </div>
    </SliderContext.Provider>
  );
}