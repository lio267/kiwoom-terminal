'use client';

import { create } from "zustand";

interface AuthState {
  connected: boolean;
  lastError?: string;
  tokenExpiresAt?: string;
  setConnected: (value: boolean) => void;
  setLastError: (message?: string) => void;
  setTokenExpiresAt: (iso?: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  connected: false,
  lastError: undefined,
  tokenExpiresAt: undefined,
  setConnected: (value) => set({ connected: value }),
  setLastError: (message) => set({ lastError: message }),
  setTokenExpiresAt: (iso) => set({ tokenExpiresAt: iso }),
}));
