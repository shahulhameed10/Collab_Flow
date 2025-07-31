import * as React from "react";
import { Label as LabelPrimitive } from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive>
>(({ className, ...props }, ref) => (
  <LabelPrimitive ref={ref} className={cn("text-sm font-medium", className)} {...props} />
));
Label.displayName = "Label";
