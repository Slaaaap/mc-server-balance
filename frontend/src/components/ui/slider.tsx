import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
    >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-[#D7E3F0]">
            <SliderPrimitive.Range className="bg-alderan-blue absolute h-full bg-[#47ABB5]" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="ease block h-5 w-5 cursor-grab rounded-full bg-[#47ABB5] transition-all duration-200 focus:outline-none active:scale-110" />
    </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
