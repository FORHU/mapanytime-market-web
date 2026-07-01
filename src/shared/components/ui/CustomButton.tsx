import React from "react";
import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  loading,
  disabled,
  variant = "contained",
  color = "primary",
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      disabled={disabled || loading}
      {...props}
      sx={{
        borderRadius: "8px",
        textTransform: "none",
        fontWeight: 600,
        padding: "8px 16px",
        boxShadow: variant === "contained" ? "none" : undefined,
        "&:hover": {
          boxShadow: variant === "contained" ? "none" : undefined,
        },
        ...props.sx,
      }}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
};
