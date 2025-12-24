import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// We extend the default Supabase User type to include 'name' 
// so your existing UI code (like "Welcome, {user.name}") doesn't break.
interface AppUser extends SupabaseUser {
  name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to map Supabase session to your AppUser format
  const mapSessionToUser = (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }
    const currentUser = session.user;
    setUser({
      ...currentUser,
      // This bridges the gap: Supabase stores name in metadata, 
      // but your app expects it at the top level.
      name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0],
    } as AppUser);
  };

  useEffect(() => {
    // 1. Check for existing session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      mapSessionToUser(session);
      setIsLoading(false);
    });

    // 2. Set up a listener for real-time auth changes (login/logout/token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      mapSessionToUser(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- ACTIONS ---

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // IMPORTANT: We save the name here so our SQL Trigger (Phase 2)
        // can copy it to the 'profiles' table.
        data: {
          name: name,
        },
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, signup, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}