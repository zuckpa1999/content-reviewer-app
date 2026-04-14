import { createContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../../supabaseClient';
import { User, AuthContextType } from '../../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.full_name?.split(' ')[0] || 'User',
          lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        });
      }
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.user_metadata?.full_name?.split(' ')[0] || 'User',
          lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (provider: 'google') => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}



