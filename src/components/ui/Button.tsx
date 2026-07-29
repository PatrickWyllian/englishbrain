"use client";

import { forwardRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading,
      children,
      className,
      disabled,
      onClick,
    },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        transition={{ duration: 0.1 }}
        onClick={onClick}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          {
            "bg-accent text-n-950 hover:bg-accent-600": variant === "primary",
            "bg-n-800 text-n-200 border border-n-700 hover:border-n-500":
              variant === "secondary",
            "bg-transparent text-n-300 hover:text-foreground hover:bg-n-800/50":
              variant === "ghost",
            "bg-error/10 text-error border border-error/30 hover:bg-error/20":
              variant === "danger",
          },
          {
            "px-4 py-2 text-sm": size === "sm",
            "px-6 py-3 text-base": size === "md",
            "px-8 py-4 text-lg": size === "lg",
          },
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className,
        )}
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
