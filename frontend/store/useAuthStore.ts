import { create } from "zustand";
import { User } from "../types";


interface AuthState {
    accessToken: string | null;
    user: User | null;
    otpToken: string | null;
    pendingEmail: string | null;
    isInitializing: boolean;
    setOtpToken: (token: string) => void;
    setPendingEmail: (email: string) => void;
    setToken: (token: string) => void;
    setAuth: (accessToken: string, user: User) => void;
    logout: () => void;
    setInitializing: (initializing: boolean) => void;
}


export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    otpToken: null,
    pendingEmail: null,
    isInitializing: true,
    setOtpToken: (token: string) => set({ otpToken: token }),
    setPendingEmail: (email: string) => set({ pendingEmail: email }),
    setToken: (token: string) => set({ accessToken: token }),
    setAuth: (accessToken: string, user: User) => set({ accessToken, user, isInitializing: false }),
    logout: () => set({ accessToken: null, user: null, isInitializing: false }),
    setInitializing: (initializing: boolean) => set({ isInitializing: initializing }),
}));




