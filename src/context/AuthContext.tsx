import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithClerk: (
    email: string,
    name?: string,
    clerkUserId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'up_admin_token';
const USER_KEY = 'up_admin_user';

// Production backend hosted on Render
const API_URL = 'https://festive-food.onrender.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Verify token on load
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/admin/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();

          if (data.user) {
            setUser(data.user);
            localStorage.setItem(
              USER_KEY,
              JSON.stringify(data.user)
            );
          }
        } else {
          // Token invalid or expired
          setToken(null);
          setUser(null);

          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (err) {
        console.error('Session verify failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [token]);

  const loginWithClerk = async (
    email: string,
    name?: string,
    clerkUserId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/clerk-auth`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email,
          name,
          clerkUserId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error:
            data.error ||
            'Clerk admin authorization failed.',
        };
      }

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user)
      );

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error: 'Network error verifying admin status.',
      };
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Login failed.',
        };
      }

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(data.user)
      );

      return {
        success: true,
      };
    } catch {
      return {
        success: false,
        error: 'Network error during login.',
      };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/admin/logout`, {
        method: 'POST',
      });
    } catch {
      // Ignore logout network errors
    }

    setToken(null);
    setUser(null);

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        loginWithClerk,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};
