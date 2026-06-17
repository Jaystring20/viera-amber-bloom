import React from "react";
import { motion, useReducedMotion } from "framer-motion";

type CardVariant = "default" | "glass" | "solid" | "ghost";
type EcosystemArm = "illustrations" | "vagin" | "viva" | "vam" | "vash";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  ecosystemArm?: EcosystemArm;
  hoverable?: boolean;
  interactive?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "bg-brand-dark border border-ecosystem-illustrations rounded-lg",
  glass:
    "bg-glass backdrop-filter backdrop-blur-lg border border-ecosystem-illustrations rounded-lg",
  solid: "bg-brand-dark rounded-lg shadow-lg",
  ghost: "bg-transparent border border-brand-textDim rounded-lg",
};

const ecosystemBorderMap: Record<EcosystemArm, string> = {
  illustrations: "border-ecosystem-illustrations",
  vagin: "border-ecosystem-vagin",
  viva: "border-ecosystem-viva",
  vam: "border-ecosystem-vam",
  vash: "border-ecosystem-vash",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "glass",
      ecosystemArm = "illustrations",
      hoverable = false,
      interactive = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const baseStyles = "rounded-lg transition-all duration-300";
    const variantClass = variantStyles[variant];
    const borderClass = ecosystemArm
      ? ecosystemBorderMap[ecosystemArm]
      : "";

    const hoverClass =
      hoverable || interactive
        ? "hover:shadow-lg hover:scale-105"
        : "";

    const cursorClass = interactive ? "cursor-pointer" : "";

    const finalClassName = `${baseStyles} ${variantClass} ${borderClass} ${hoverClass} ${cursorClass} ${className}`.trim();

    const hoverVariant = hoverable || interactive ? { y: -4 } : {};

    return (
      <motion.div
        ref={ref}
        className={finalClassName}
        whileHover={shouldReduceMotion ? {} : hoverVariant}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { type: "spring" as const, stiffness: 350, damping: 25 }
        }
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export default Card;

// ─── Card Subcomponents ───────────────────────────────────────────────────

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 border-b border-ecosystem-illustrations border-opacity-20 ${className}`.trim()}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`font-display text-xl font-bold text-brand-text ${className}`.trim()}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`font-body text-sm text-brand-textDim ${className}`.trim()}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`.trim()} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 border-t border-ecosystem-illustrations border-opacity-20 flex justify-end gap-3 ${className}`.trim()}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";
