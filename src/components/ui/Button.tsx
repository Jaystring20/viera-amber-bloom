import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";
type EcosystemArm = "illustrations" | "vagin" | "viva" | "vam" | "vash";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  ecosystemArm?: EcosystemArm;
  isLoading?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-ecosystem-illustrations text-brand-dark hover:opacity-90",
  secondary:
    "bg-transparent border-2 border-ecosystem-illustrations text-ecosystem-illustrations hover:bg-ecosystem-illustrations hover:text-brand-dark",
  accent:
    "bg-ecosystem-vagin-accent text-white hover:opacity-90",
  ghost: "bg-transparent text-ecosystem-illustrations hover:bg-ecosystem-illustrations hover:text-white",
  destructive:
    "bg-error text-white hover:opacity-90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

const ecosystemColorMap: Record<EcosystemArm, string> = {
  illustrations: "bg-ecosystem-illustrations text-brand-dark",
  vagin: "bg-ecosystem-vagin text-white",
  viva: "bg-ecosystem-viva text-white",
  vam: "bg-ecosystem-vam text-brand-dark",
  vash: "bg-ecosystem-vash text-white",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      ecosystemArm,
      isLoading = false,
      fullWidth = false,
      disabled = false,
      children,
      className = "",
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const baseStyles =
      "font-body rounded-lg font-medium uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClass = ecosystemArm
      ? ecosystemColorMap[ecosystemArm]
      : variantStyles[variant];

    const sizeClass = sizeStyles[size];
    const widthClass = fullWidth ? "w-full" : "";

    const finalClassName = `${baseStyles} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim();

    return (
      <motion.button
        ref={ref}
        className={finalClassName}
        disabled={disabled || isLoading}
        aria-label={ariaLabel}
        whileHover={
          !disabled && !isLoading && !shouldReduceMotion
            ? { scale: 1.02, opacity: 0.95 }
            : undefined
        }
        whileTap={
          !disabled && !isLoading && !shouldReduceMotion
            ? { scale: 0.98 }
            : undefined
        }
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 350, damping: 25 }
        }
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
