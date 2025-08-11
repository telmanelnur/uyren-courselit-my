import React from "react";
import { cn } from "@workspace/ui/lib/utils"
import type { ThemeStyle } from "@workspace/page-models";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  theme?: ThemeStyle;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "default",
    size = "default",
    disabled = false,
    children,
    className = "",
    theme,
    ...props
}) => {
    const buttonStyles = theme?.interactives?.button;
    const typographyStyles = theme?.typography?.button;

    const classes = cn(
        buttonVariants({ variant, size }),
        // Theme typography
        typographyStyles?.fontFamily,
        typographyStyles?.fontSize,
        typographyStyles?.fontWeight,
        typographyStyles?.lineHeight,
        typographyStyles?.letterSpacing,
        typographyStyles?.textTransform,
        typographyStyles?.textDecoration,
        typographyStyles?.textOverflow,
        // Theme interactivity
        buttonStyles?.padding?.x,
        buttonStyles?.padding?.y,
        buttonStyles?.border?.width,
        buttonStyles?.border?.radius,
        buttonStyles?.border?.style,
        buttonStyles?.shadow,
        // Theme disabled states
        disabled && buttonStyles?.disabled?.opacity,
        disabled && buttonStyles?.disabled?.cursor,
        disabled && buttonStyles?.disabled?.color,
        disabled && buttonStyles?.disabled?.background,
        disabled && buttonStyles?.disabled?.border,
        // User overrides
        buttonStyles?.custom,
        className,
    );

    return (
        <button
            disabled={disabled}
            className={classes}
            {...props}
        >
            {children}
        </button>
    );
};
