import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { API_BASE_URL } from "@/config";

interface User {
    role: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    isLoading: boolean;
    login: (password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // On mount, check if a valid session cookie exists by hitting /api/auth/admin/me
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/admin/me`, {
                    credentials: 'include', // sends HTTP-Only cookies
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setIsLoggedIn(true);
                }
            } catch {
                // No valid session, stay logged out
            } finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // receives the HTTP-Only cookie
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                setUser(data.user);
                setIsLoggedIn(true);
                return { success: true };
            }
            return { success: false, message: data.message || 'Login failed' };
        } catch {
            return { success: false, message: 'Network error' };
        }
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/admin/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Best effort
        }
        setIsLoggedIn(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
