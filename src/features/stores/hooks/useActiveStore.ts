import { useEffect, useState } from "react";

const ACTIVE_STORE_KEY = "active_store_context_id";

export function useActiveStore() {
  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setActiveStoreIdState(localStorage.getItem(ACTIVE_STORE_KEY));
    setIsHydrated(true);
  }, []);

  const setActiveStoreId = (storeId: string) => {
    localStorage.setItem(ACTIVE_STORE_KEY, storeId);
    setActiveStoreIdState(storeId);
  };

  const clearActiveStore = () => {
    localStorage.removeItem(ACTIVE_STORE_KEY);
    setActiveStoreIdState(null);
  };

  return { activeStoreId, isHydrated, setActiveStoreId, clearActiveStore };
}
