"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthUser } from "./types";
import { loginUser, registerUser } from "./auth-api";

const STORAGE_KEY = "fairshare_user";
export const TOKEN_STORAGE_KEY = "fairshare_token";

interface AuthState {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, inviteGroupId?: string) => Promise<void>;
  register: (name: string, email: string, password: string, inviteGroupId?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      // Ignore corrupt data
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, inviteGroupId?: string) => {
    const result = await loginUser({ email, password, invite_group_id: inviteGroupId });
    setCurrentUser(result.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, result.accessToken);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    inviteGroupId?: string,
  ) => {
    const result = await registerUser({ name, email, password, invite_group_id: inviteGroupId });
    setCurrentUser(result.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, result.accessToken);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
