'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { useSupabase } from '@/app/supabase-provider';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  institution: string | null;
  country: string | null;
  phone: string | null;
  username: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session check and subscription to auth changes
  useEffect(() => {
    async function getInitialSession() {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Fetch user profile
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    getInitialSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        console.log(`Auth event: ${event}`);
        
        // Always update the session and user state immediately
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          // Trigger profile fetch for any auth event with a user
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
        
        // Force refresh for auth changes
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          router.refresh();
        }
        if (event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for user:', userId);
      
      // First try to get the profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If the profile doesn't exist, create one
        if (error.code === 'PGRST116') { // No rows returned error code
          console.log('Profile not found, creating new profile');
          
          // Get user metadata from auth.users
          const { data: userData } = await supabase.auth.getUser();
          const userMeta = userData?.user?.user_metadata || {};
          
          // Prepare profile data from metadata if available
          const profileData = {
            id: userId,
            first_name: userMeta.first_name || userMeta.given_name || '',
            last_name: userMeta.last_name || userMeta.family_name || '',
            institution: userMeta.institution || userMeta.organization || userMeta.company || '',
            username: userMeta.preferred_username || userMeta.name || userMeta.email?.split('@')[0] || ''
          };
          
          // Create profile
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([profileData])
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            return;
          }
          
          console.log('New profile created:', newProfile);
          setProfile(newProfile as UserProfile);
          return;
        }
        
        return;
      }
      
      console.log('Profile loaded successfully:', data);
      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      // Create auth user
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name
          }
        }
      });
      
      if (signUpError) {
        return { error: signUpError };
      }
      
      // User profile data will be created by database trigger
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    // Construct options only when called (client-side)
    const options = {
      provider: 'google' as const,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    };
    await supabase.auth.signInWithOAuth(options);
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', user.id);
      
      if (!error && profile) {
        setProfile({ ...profile, ...data });
      }
      
      return { error };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 