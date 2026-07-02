import React from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  id,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3 py-1.5 text-sm bg-white border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
            : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};
