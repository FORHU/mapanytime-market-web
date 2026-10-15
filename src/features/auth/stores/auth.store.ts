import { create } from "zustand";
import {
  getToken,
  setToken as setStorageToken,
  clearToken as clearStorageToken,
} from "@/shared/lib/token";
import { setOnTokenClear } from "@/shared/lib/http";

/**
 * The signed-in session's bearer token. One token, no refresh token: the API
 * issues Better Auth sessions that slide forward with use (API #122).
 */
interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  setToken: (token) => {
    if (token) setStorageToken(token);
    else clearStorageToken();
    set({ token });
  },
  clearToken: () => {
    clearStorageToken();
    set({ token: null });
  },
}));

setOnTokenClear(() => {
  useAuthStore.getState().clearToken();
});
