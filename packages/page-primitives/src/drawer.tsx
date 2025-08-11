import type { ThemeStyle } from "@workspace/page-models";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { cn } from "@workspace/ui/lib/utils";
import { ReactNode } from "react";

interface DrawerProps {
  trigger: ReactNode;
  children: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  open: boolean;
  setOpen: (open: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
  theme?: ThemeStyle;
}

export function Drawer({
  trigger,
  children,
  side = "left",
  open,
  setOpen,
  style,
  className = "",
  theme,
}: DrawerProps) {
  const classes = cn(
    // Base styles
    "courselit-theme",
    className
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <span>{trigger}</span>
      </SheetTrigger>
      <SheetContent side={side} style={style} className={classes}>
        {children}
      </SheetContent>
    </Sheet>
  );
}
