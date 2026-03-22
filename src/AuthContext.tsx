import { createContext, useContext, useState } from 'react';

export type AuthProvider = 'google' | 'facebook';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  provider: AuthProvider;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (provider: AuthProvider) => Promise<void>;
  logout: () => void;
}

const MOCK_USERS: Record<AuthProvider, User> = {
  google: {
    id: 'mock-google-001',
    firstName: 'Barameerak',
    lastName: 'Koonmongkon',
    email: 'barameerak.koonmongkon@gmail.com',
    provider: 'google',
  },
  facebook: {
    id: 'mock-fb-001',
    firstName: 'Barameerak',
    lastName: 'Koonmongkon',
    email: 'barameerak.koonmongkon@gmail.com',
    provider: 'facebook',
  },
};

const LS_KEY = 'mediavault-auth-user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (provider: AuthProvider) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    const newUser = MOCK_USERS[provider];
    setUser(newUser);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(newUser));
    } catch { /* silently fail */ }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(LS_KEY);
    } catch { /* silently fail */ }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function getUserInitials(user: User): string {
  return `${user.firstName[0]}`.toUpperCase();
}
