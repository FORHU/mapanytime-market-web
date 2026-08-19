import { useEffect, useState, useCallback } from "react";

const ACTIVE_STORE_KEY = "active_store_context_id";

export function useActiveStore() {
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const syncStore = useCallback(() => {
    if (typeof window !== "undefined") {
      setActiveStoreIdState(localStorage.getItem(ACTIVE_STORE_KEY));
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    syncStore();

    const handleStorage = () => syncStore();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("active_store_changed", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("active_store_changed", handleStorage);
    };
  }, [syncStore]);

  const setActiveStoreId = (storeId: string) => {
    localStorage.setItem(ACTIVE_STORE_KEY, storeId);
    setActiveStoreIdState(storeId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("active_store_changed"));
    }
  };

  const clearActiveStore = () => {
    localStorage.removeItem(ACTIVE_STORE_KEY);
    setActiveStoreIdState(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("active_store_changed"));
    }
  };

  return { activeStoreId, isHydrated, setActiveStoreId, clearActiveStore };
}
