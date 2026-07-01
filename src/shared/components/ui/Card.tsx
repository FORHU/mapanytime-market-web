import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "flat" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "elevated",
  padding = "md",
  className = "",
  ...props
}) => {
  // Define style mappings based on props
  const baseStyle =
    "border-radius: 8px; background-color: #ffffff; transition: all 0.2s ease;";

  const variantStyles = {
    flat: "background-color: #f8f9fa; border: none;",
    elevated:
      "box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);",
    outlined: "border: 1px solid #e2e8f0;",
  };

  const paddingStyles = {
    none: "padding: 0;",
    sm: "padding: 12px;",
    md: "padding: 20px;",
    lg: "padding: 32px;",
  };

  // Combine styles inline or map them to your utility classes (like Tailwind)
  const combinedStyles = `${baseStyle} ${variantStyles[variant]} ${paddingStyles[padding]}`;

  return (
    <div style={parseStyles(combinedStyles)} className={className} {...props}>
      {children}
    </div>
  );
};

// Quick helper to turn string styles into a React style object
const parseStyles = (styleStr: string) => {
  return styleStr.split(";").reduce((acc: any, style) => {
    const [key, value] = style.split(":");
    if (key && value)
      acc[key.trim().replace(/-./g, (c) => c.substr(1).toUpperCase())] =
        value.trim();
    return acc;
  }, {});
};
