"use client";

import React, { createContext, useContext, useState } from "react";
import { AlertColor } from "@mui/material";
import { Snackbar } from "./Snackbar";

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

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      {/* Single source of truth: the provider renders the shared Snackbar primitive */}
      <Snackbar
        open={open}
        message={message}
        severity={severity}
        onClose={() => setOpen(false)}
      />
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
