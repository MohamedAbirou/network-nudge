import { AuthError, Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase, UserProfile } from '../lib/supabase';

interface LinkedInTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
}

interface UserConsents {
  linkedin_data_storage: boolean;
  marketing_emails: boolean;
  analytics_tracking: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  linkedInConnected: boolean;
  userConsents: UserConsents | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshLinkedInStatus: () => Promise<void>;
  loadUserConsents: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [userConsents, setUserConsents] = useState<UserConsents | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const refreshLinkedInStatus = async () => {
    if (user) {
      try {
        const { data: credentials } = await supabase
          .from('user_credentials')
          .select('linkedin_tokens')
          .eq('user_id', user.id)
          .single();

        setLinkedInConnected(!!credentials?.linkedin_tokens);
      } catch (error) {
        console.error('Error checking LinkedIn status:', error);
        setLinkedInConnected(false);
      }
    }
  };

  const loadUserConsents = async () => {
    if (user) {
      try {
        const { data: consents } = await supabase
          .from('user_consents')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (consents) {
          setUserConsents({
            linkedin_data_storage: consents.linkedin_data_storage,
            marketing_emails: consents.marketing_emails,
            analytics_tracking: consents.analytics_tracking,
          });
        }
      } catch (error) {
        console.error('Error loading user consents:', error);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
        refreshLinkedInStatus();
        loadUserConsents();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
        refreshLinkedInStatus();
        loadUserConsents();
      } else {
        setProfile(null);
        setLinkedInConnected(false);
        setUserConsents(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error && data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          notification_email: true,
          notification_frequency: 'weekly',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

      if (!profileError) {
        await supabase.from('subscriptions').insert({
          user_id: data.user.id,
          plan_type: 'free',
          status: 'active',
          nudges_limit: 5,
        });

        // Create default team
        await supabase.from('teams').insert({
          owner_id: data.user.id,
          name: 'Personal',
          subscription_plan: 'free',
          max_seats: 1,
          current_seats: 1,
        });
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        linkedInConnected,
        userConsents,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
        refreshLinkedInStatus,
        loadUserConsents,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
