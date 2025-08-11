import type { ThemeStyle } from "@workspace/page-models";
import {
  badgeVariants,
  Badge as ShadcnBadge,
} from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { VariantProps } from "class-variance-authority";
import React from "react";

type ShadcnBadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

export interface BadgeProps extends Omit<ShadcnBadgeProps, "variant"> {
  theme?: ThemeStyle;
  style?: Record<string, string>;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  children,
  className = "",
  style = {},
  theme,
  ...props
}) => {
  const typographyStyles = theme?.typography?.caption;
  const buttonStyles = theme?.interactives?.button;

  const classes = cn(
    // Base styles
    // "bg-secondary",
    // Theme typography from caption
    typographyStyles?.fontFamily,
    typographyStyles?.fontSize,
    typographyStyles?.fontWeight,
    typographyStyles?.lineHeight,
    typographyStyles?.letterSpacing,
    typographyStyles?.textTransform,
    buttonStyles?.border?.width,
    buttonStyles?.border?.radius,
    buttonStyles?.border?.style,
    className
  );

  return (
    <ShadcnBadge
      variant={variant}
      className={classes}
      style={{
        ...style,
        backgroundColor: style.backgroundColor,
        color: style.color,
      }}
      {...props}
    >
      {children}
    </ShadcnBadge>
  );
};
