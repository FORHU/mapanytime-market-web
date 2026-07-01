import React from "react";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "danger";
  loading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  loading,
  disabled,
  variant = "contained",
  color = "primary",
  className = "",
  ...props
}) => {
  // Base structural classes
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg text-sm px-4 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Color variant combinations matching your dashboard palette
  const variantStyles = {
    contained: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    },
    outlined: {
      primary:
        "border-2 border-blue-600 text-blue-600 hover:bg-blue-50/50 focus:ring-blue-500",
      secondary:
        "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
      danger:
        "border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500",
    },
    text: {
      primary: "text-blue-600 hover:bg-blue-50 context-transparent",
      secondary: "text-gray-600 hover:bg-gray-50 context-transparent",
      danger: "text-red-600 hover:bg-red-50 context-transparent",
    },
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant][color]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
};
