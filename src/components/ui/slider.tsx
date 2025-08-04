import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  snapPoints?: number[];
  snapThreshold?: number;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, snapPoints = [], snapThreshold = 5, onValueChange, ...props }, ref) => {
  const handleValueChange = (value: number[]) => {
    if (snapPoints.length > 0) {
      const newValue = value[0];
      const closestSnap = snapPoints.find(snap => 
        Math.abs(newValue - snap) <= snapThreshold
      );
      
      if (closestSnap !== undefined) {
        onValueChange?.([closestSnap]);
        return;
      }
    }
    onValueChange?.(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentValue = (props.value || props.defaultValue || [0])[0];
      const step = props.step || 1;
      const newValue = e.key === 'ArrowLeft' 
        ? Math.max((props.min || 0), currentValue - step)
        : Math.min((props.max || 100), currentValue + step);
      onValueChange?.([newValue]);
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      const currentValue = (props.value || props.defaultValue || [0])[0];
      const bigStep = 10;
      const newValue = e.key === 'PageUp' 
        ? Math.min((props.max || 100), currentValue + bigStep)
        : Math.max((props.min || 0), currentValue - bigStep);
      onValueChange?.([newValue]);
    }
  };

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      onValueChange={handleValueChange}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
        {/* Snap point indicators */}
        {snapPoints.map((point) => (
          <div
            key={point}
            className="absolute top-0 w-0.5 h-full bg-muted-foreground/30"
            style={{ left: `${point}%` }}
          />
        ))}
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
