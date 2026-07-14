import { create } from "zustand";
import { getToken, setToken, clearToken } from "@/shared/lib/token";

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
}

/**
 * Reactive (Zustand) view over the same persisted token shared/lib/http.ts
 * reads. Persistence itself always goes through shared/lib/token.ts so the
 * two can never drift onto different storage keys again.
 */
export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  setToken: (token) => {
    if (token) setToken(token);
    else clearToken();
    set({ token });
  },
  clearToken: () => {
    clearToken();
    set({ token: null });
  },
}));
