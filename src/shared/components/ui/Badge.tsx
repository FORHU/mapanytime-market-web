import React from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyle =
    "display: inline-flex; align-items: center; justify-content: center; font-weight: 600; border-radius: 9999px; width: fit-content;";

  const sizeStyles = {
    sm: "padding: 2px 8px; font-size: 11px;",
    md: "padding: 4px 12px; font-size: 13px;",
  };

  const variantStyles = {
    success: "background-color: #def7ec; color: #03543f;",
    warning: "background-color: #fef3c7; color: #92400e;",
    error: "background-color: #fde8e8; color: #9b1c1c;",
    info: "background-color: #e1effe; color: #1e429f;",
    neutral: "background-color: #f3f4f6; color: #374151;",
  };

  const combinedStyles = `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]}`;

  return (
    <span style={parseStyles(combinedStyles)} className={className} {...props}>
      {children}
    </span>
  );
};

const parseStyles = (styleStr: string) => {
  return styleStr.split(";").reduce((acc: any, style) => {
    const [key, value] = style.split(":");
    if (key && value)
      acc[key.trim().replace(/-./g, (c) => c.substr(1).toUpperCase())] =
        value.trim();
    return acc;
  }, {});
};
