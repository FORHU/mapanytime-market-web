"use client";

import React from "react";
import { Snackbar as MuiSnackbar, Alert, AlertColor } from "@mui/material";

interface SnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor; // 'success' | 'error' | 'warning' | 'info'
  onClose: () => void;
  autoHideDuration?: number;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  open,
  message,
  severity = "success",
  onClose,
  autoHideDuration = 4000,
}) => {
  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    // Avoid closing if user clicks outside accidentally
    if (reason === "clickaway") return;
    onClose();
  };

  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }} // Uniform positioning
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%", fontWeight: 600, borderRadius: "12px" }}
      >
        {message}
      </Alert>
    </MuiSnackbar>
  );
};
