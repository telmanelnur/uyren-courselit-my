import type { ThemeStyle } from "@workspace/page-models";
import { Switch as ShadcnSwitch } from "@workspace/ui/components/switch";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof ShadcnSwitch> {
  theme?: ThemeStyle;
}

export const Switch = React.forwardRef<
  React.ElementRef<typeof ShadcnSwitch>,
  SwitchProps
>(({ className = "", theme, ...props }, ref) => {
  const classes = cn(
    // Base styles
    "",
    // User overrides
    className
  );

  return <ShadcnSwitch ref={ref} className={classes} {...props} />;
});
