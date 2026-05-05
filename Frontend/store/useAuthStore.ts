import { create } from "zustand";
import { User } from "../types";


interface AuthState {
    accessToken: string | null;
    user: User | null;
    setToken: (token: string) => void;
    setAuth: (accessToken: string, user: User) => void;
    logout: () => void;
}


export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    setToken: (token: string) => set({ accessToken: token }),
    setAuth: (accessToken: string, user: User) => set({ accessToken, user }),
    logout: () => set({ accessToken: null, user: null }),
}));




