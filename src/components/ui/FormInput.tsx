import React, { useState } from "react";

interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const inputBaseStyles =
  "w-full px-3 py-2 font-body text-sm rounded-lg bg-brand-dark bg-opacity-60 backdrop-filter backdrop-blur-sm border border-ecosystem-illustrations border-opacity-15 text-brand-text placeholder-brand-textDim outline-none transition-all duration-200";

const inputFocusStyles =
  "focus:border-ecosystem-illustrations focus:border-opacity-40 focus:bg-opacity-75 focus:bg-brand-dark focus:shadow-lg";

const inputErrorStyles =
  "border-error border-opacity-60 focus:border-error focus:border-opacity-100";

export const FormInput = React.forwardRef<
  HTMLInputElement,
  FormInputProps
>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = "",
      ...props
    },
    ref
  ) => {
    const inputClass = `${inputBaseStyles} ${inputFocusStyles} ${
      error ? inputErrorStyles : ""
    } ${className}`.trim();

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            className="block font-body text-sm font-medium text-brand-text mb-2"
            htmlFor={props.id}
          >
            {label}
            {props.required && (
              <span className="text-ecosystem-illustrations ml-1">*</span>
            )}
          </label>
        )}
        <input
          ref={ref}
          className={inputClass}
          {...props}
        />
        {error && (
          <p
            className="mt-1 font-body text-xs text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 font-body text-xs text-brand-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

// ─── Password Input with Toggle ────────────────────────────────────────────

interface FormPasswordProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const FormPassword = React.forwardRef<
  HTMLInputElement,
  FormPasswordProps
>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = "",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputClass =
      `${inputBaseStyles} ${inputFocusStyles} ${
        error ? inputErrorStyles : ""
      } pr-10 ${className}`.trim();

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            className="block font-body text-sm font-medium text-brand-text mb-2"
            htmlFor={props.id}
          >
            {label}
            {props.required && (
              <span className="text-ecosystem-illustrations ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={inputClass}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-textDim hover:text-brand-text transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
        </div>
        {error && (
          <p
            className="mt-1 font-body text-xs text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 font-body text-xs text-brand-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormPassword.displayName = "FormPassword";

// ─── Textarea ─────────────────────────────────────────────────────────────

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = "",
      ...props
    },
    ref
  ) => {
    const textareaClass = `${inputBaseStyles} ${inputFocusStyles} ${
      error ? inputErrorStyles : ""
    } resize-vertical min-h-[100px] ${className}`.trim();

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            className="block font-body text-sm font-medium text-brand-text mb-2"
            htmlFor={props.id}
          >
            {label}
            {props.required && (
              <span className="text-ecosystem-illustrations ml-1">*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          className={textareaClass}
          {...props}
        />
        {error && (
          <p
            className="mt-1 font-body text-xs text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 font-body text-xs text-brand-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

// ─── Select ───────────────────────────────────────────────────────────────

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const FormSelect = React.forwardRef<
  HTMLSelectElement,
  FormSelectProps
>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      options,
      className = "",
      ...props
    },
    ref
  ) => {
    const selectClass = `${inputBaseStyles} ${inputFocusStyles} ${
      error ? inputErrorStyles : ""
    } appearance-none cursor-pointer ${className}`.trim();

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            className="block font-body text-sm font-medium text-brand-text mb-2"
            htmlFor={props.id}
          >
            {label}
            {props.required && (
              <span className="text-ecosystem-illustrations ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={selectClass}
            {...props}
          >
            <option value="" disabled>
              {props.placeholder || "Select an option"}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-textDim pointer-events-none"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {error && (
          <p
            className="mt-1 font-body text-xs text-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 font-body text-xs text-brand-textDim">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

// ─── Label ────────────────────────────────────────────────────────────────

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = "", ...props }, ref) => (
  <label
    ref={ref}
    className={`font-body text-sm font-medium text-brand-text ${className}`.trim()}
    {...props}
  />
));

FormLabel.displayName = "FormLabel";

// ─── Form Group ───────────────────────────────────────────────────────────

export const FormGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`space-y-3 ${className}`.trim()} {...props} />
));

FormGroup.displayName = "FormGroup";

// ─── Help Text ────────────────────────────────────────────────────────────

export const FormHelperText = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`font-body text-xs text-brand-textDim ${className}`.trim()}
    {...props}
  />
));

FormHelperText.displayName = "FormHelperText";

// ─── Error Text ───────────────────────────────────────────────────────────

export const FormError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`font-body text-xs text-error ${className}`.trim()}
    {...props}
  />
));

FormError.displayName = "FormError";
