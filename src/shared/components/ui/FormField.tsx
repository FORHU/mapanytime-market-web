"use client";

import React from "react";

// Extend native input options so attributes like 'type', 'required', and 'placeholder' are naturally tracked
export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  type = "text", // Default fallback parameter
  label,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1.5 w-full text-left animate-in fade-in duration-150">
      {label && (
        <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all ${className}`}
        {...props}
      />
    </div>
  );
};
