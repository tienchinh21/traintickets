"use client";

import { create } from "zustand";

import {
  getCurrentClient,
  loginClient,
  logoutClient,
  refreshClient,
  registerClient,
  type AuthSession,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/api/auth";
import { clearStoredAuthSession, readStoredAuthSession, writeStoredAuthSession } from "@/lib/auth-storage";
import { setAuthTokenManager } from "@/lib/auth-token-manager";

type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
  setSession: (session: AuthSession) => void;
  hydrate: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  refreshSession: () => Promise<string | null>;
  logout: () => Promise<void>;
};

function persistSession(session: AuthSession) {
  writeStoredAuthSession({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: session.user,
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  status: "idle",
  setSession: (session) => {
    persistSession(session);
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
      status: "authenticated",
    });
  },
  hydrate: async () => {
    const storedSession = readStoredAuthSession();

    if (!storedSession) {
      set({ status: "anonymous" });
      return;
    }

    set({ ...storedSession, status: "loading" });

    try {
      const user = await getCurrentClient();
      const session = { ...storedSession, user };
      writeStoredAuthSession(session);
      set({ ...session, status: "authenticated" });
    } catch {
      const accessToken = await get().refreshSession();

      if (!accessToken) {
        return;
      }

      try {
        const user = await getCurrentClient();
        const currentSession = get();
        const nextSession = {
          accessToken,
          refreshToken: currentSession.refreshToken ?? storedSession.refreshToken,
          user,
        };
        writeStoredAuthSession(nextSession);
        set({ ...nextSession, status: "authenticated" });
      } catch {
        clearStoredAuthSession();
        set({ accessToken: null, refreshToken: null, user: null, status: "anonymous" });
      }
    }
  },
  login: async (payload) => {
    const response = await loginClient(payload);
    get().setSession(response.data);
  },
  register: async (payload) => {
    const response = await registerClient(payload);
    get().setSession(response.data);
  },
  refreshSession: async () => {
    const refreshToken = get().refreshToken;

    if (!refreshToken) {
      clearStoredAuthSession();
      set({ accessToken: null, refreshToken: null, user: null, status: "anonymous" });
      return null;
    }

    try {
      const response = await refreshClient(refreshToken);
      get().setSession(response.data);
      return response.data.accessToken;
    } catch {
      clearStoredAuthSession();
      set({ accessToken: null, refreshToken: null, user: null, status: "anonymous" });
      return null;
    }
  },
  logout: async () => {
    const refreshToken = get().refreshToken;

    clearStoredAuthSession();
    set({ accessToken: null, refreshToken: null, user: null, status: "anonymous" });

    if (refreshToken) {
      await logoutClient(refreshToken);
    }
  },
}));

setAuthTokenManager({
  getAccessToken: () => useAuthStore.getState().accessToken,
  refreshAccessToken: () => useAuthStore.getState().refreshSession(),
});
