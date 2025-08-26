import { forwardRef } from "react";
import Link from "./link";

interface CommonButtonProps {
  children: React.ReactNode;
  variant?: "soft" | "classic";
  className?: string;
  style?: Record<string, string>;
  [key: string]: any;
}

interface ButtonButtonProps extends CommonButtonProps {
  component: "button";
  onClick?: (...args: any[]) => any;
  href?: never;
}

interface LinkButtonProps extends CommonButtonProps {
  component: "link";
  href?: string;
  onClick?: never;
}

type ButtonProps = ButtonButtonProps | LinkButtonProps;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, forwardedRef) => {
    const {
      children,
      className = "",
      style,
      component = "button",
      variant = "classic",
      ...other
    } = props;
    let commonClasses =
      "flex items-center gap-1 py-1 px-2 rounded disabled:pointer-events-none";

    if (variant === "classic") {
      commonClasses +=
        " bg-black text-white hover:!text-white hover:!bg-slate-500 active:!bg-slate-600 disabled:bg-slate-300";
    } else {
      commonClasses +=
        " bg-slate-100 text-black hover:!bg-slate-200 active:!bg-slate-300 disabled:text-slate-300";
    }

    if (component === "link") {
      const linkProps = props as LinkButtonProps;
      return (
        <Link
          href={linkProps.href || ""}
          className={`${commonClasses} ${className}`}
          style={{ ...style }}
        >
          <span ref={forwardedRef as React.Ref<HTMLSpanElement>} {...other}>
            {children}
          </span>
        </Link>
      );
    }

    return (
      <button
        className={`${commonClasses} ${className}`}
        onClick={props.onClick}
        style={{ ...style }}
        ref={forwardedRef as React.Ref<HTMLButtonElement>}
        {...other}
      >
        {children}
      </button>
    );
  },
);

export default Button;
