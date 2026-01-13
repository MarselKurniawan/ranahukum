import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'lawyer' | 'user' | 'superadmin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole, location?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; suspended?: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetch with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Fetch all roles for user (might have multiple)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching role:', error);
        return;
      }

      if (data && data.length > 0) {
        // Priority: superadmin > admin > lawyer > user
        const rolePriority: AppRole[] = ['superadmin', 'admin', 'lawyer', 'user'];
        const userRoles = data.map(r => r.role as AppRole);
        
        for (const priorityRole of rolePriority) {
          if (userRoles.includes(priorityRole)) {
            setRole(priorityRole);
            return;
          }
        }
        
        // Default to first role if no priority match
        setRole(data[0].role as AppRole);
      }
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole, location?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          location: location
        }
      }
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { error: error as Error | null, suspended: false };
    }

    // Check if user is suspended
    if (data?.user) {
      // Check profile suspension
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_suspended')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (profile?.is_suspended) {
        await supabase.auth.signOut();
        return { 
          error: new Error('Akun Anda telah dinonaktifkan sementara. Hubungi admin untuk informasi lebih lanjut.') as Error,
          suspended: true 
        };
      }

      // Check lawyer suspension if user is a lawyer
      const { data: lawyer } = await supabase
        .from('lawyers')
        .select('is_suspended')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (lawyer?.is_suspended) {
        await supabase.auth.signOut();
        return { 
          error: new Error('Akun Lawyer Anda telah dinonaktifkan sementara. Hubungi admin untuk informasi lebih lanjut.') as Error,
          suspended: true 
        };
      }
    }

    return { error: null, suspended: false };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      loading,
      signUp,
      signIn,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
