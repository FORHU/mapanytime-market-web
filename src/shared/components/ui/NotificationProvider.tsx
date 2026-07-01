"use client";

import React, { createContext, useContext, useState } from "react";
import { Snackbar as MuiSnackbar, Alert, AlertColor } from "@mui/material";

type NotificationContextType = (message: string, severity?: AlertColor) => void;

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");

  const showNotification = (msg: string, type: AlertColor = "success") => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  const handleClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      <MuiSnackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
