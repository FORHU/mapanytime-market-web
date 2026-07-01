"use client";

import React, { createContext, useContext, useState } from "react";
import { Snackbar } from "./Snackbar";

export type NotificationSeverity = "success" | "error" | "info" | "warning";
type NotificationContextType = (
  message: string,
  severity?: NotificationSeverity,
) => void;

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<NotificationSeverity>("success");

  const showNotification = (
    msg: string,
    sev: NotificationSeverity = "success",
  ) => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      setOpen(false);
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      {/* The provider renders the custom Tailwind snackbar globally */}
      <Snackbar
        open={open}
        message={message}
        severity={severity}
        onClose={() => setOpen(false)}
      />
    </NotificationContext.Provider>
  );
};
