import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  loginEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpEmail: (email: string, password: string) => Promise<{ session?: Session | null; error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  getSession: () => Promise<{ data: { session: Session | null }; error: any }>;
  onAuthStateChange: (callback: (event: any, session: Session | null) => void) => { data: { subscription: any } };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth updates (e.g. Sign In, Sign Out, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login using Email and Password
  const loginEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Sign up using Email and Password
  const signUpEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { session: data?.session, error };
    } catch (err: any) {
      return { error: err };
    }
  };

  /*
  =============================================================
  GOOGLE OAUTH CONFIGURATION INSTRUCTIONS
  =============================================================
  To enable Google Login on your Supabase project:
  1. Go to Google Cloud Console (https://console.cloud.google.com/).
  2. Create a new project or select an existing one.
  3. Navigate to APIs & Services -> Credentials.
  4. Click "Create Credentials" -> "OAuth client ID".
  5. Select Application type as "Web application".
  6. Add Authorized redirect URIs: 
     https://jcglewyaifxitcqtauiv.supabase.co/auth/v1/callback
  7. Copy the generated "Client ID" and "Client Secret".
  8. Log in to your Supabase Dashboard -> Auth -> Providers -> Google.
  9. Turn on the Google provider, paste the Client ID and Client Secret, and Save.
  =============================================================
  */
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  // End active session
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const getSession = async () => {
    try {
      return await supabase.auth.getSession();
    } catch (err: any) {
      return { data: { session: null }, error: err };
    }
  };

  const onAuthStateChange = (callback: (event: any, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, loginEmail, signUpEmail, signInWithGoogle, signOut, getSession, onAuthStateChange }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to utilize Auth session quickly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
