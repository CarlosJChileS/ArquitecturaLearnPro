import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'student' | 'instructor' | 'admin';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  user_id: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  ensureAdminProfile: () => Promise<void>;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  hasActiveSubscription: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isAdmin = profile?.role === 'admin';
  const isInstructor = profile?.role === 'instructor';
  const isStudent = profile?.role === 'student';
  const hasActiveSubscription = subscription?.subscribed === true && 
    subscription.subscription_end && 
    new Date(subscription.subscription_end) > new Date();

  const fetchProfile = async (userId: string) => {
    // Obtener información del usuario una vez al principio
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email;
    
    try {
      console.log('=== FETCH PROFILE START ===');
      console.log('Fetching profile for userId:', userId);
      
      // Verificar si es el usuario admin conocido y crear perfil inmediatamente si es necesario
      const isKnownAdmin = userEmail === 'carlosjchiles@gmail.com' || userEmail === 'admin@learnpro.com';
      
      if (isKnownAdmin) {
        console.log('Known admin user detected, fast-tracking profile creation/fetch');
        
        // Intentar obtener perfil existente primero
        try {
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (existingProfile && !fetchError) {
            console.log('Existing admin profile found:', existingProfile);
            setProfile(existingProfile as Profile);
            console.log('=== FETCH PROFILE END (EXISTING ADMIN) ===');
            return;
          }
        } catch (fetchErr) {
          console.log('No existing profile found for admin, will create new one');
        }
        
        // Si no existe, crear perfil de admin inmediatamente
        const adminProfileData = {
          user_id: userId,
          full_name: 'Carlos J. Chile S.',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: newAdminProfile, error: createError } = await supabase
          .from('profiles')
          .insert(adminProfileData)
          .select()
          .single();
          
        if (!createError && newAdminProfile) {
          setProfile(newAdminProfile as Profile);
          console.log('Admin profile created successfully:', newAdminProfile);
          console.log('=== FETCH PROFILE END (ADMIN CREATED) ===');
          return;
        } else {
          console.error('Failed to create admin profile, falling back to regular flow');
        }
      }
      
      // Flujo regular para otros usuarios
      // Agregar timeout para la consulta
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Timeout reducido a 5 segundos para respuesta más rápida
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      console.log('Starting Supabase query...');
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      console.log('Supabase query completed');

      console.log('Raw Supabase response:', { data, error });

      if (error) {
        console.error('Error fetching profile:', error);
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        console.log('Error details:', error.details);
        console.log('Error hint:', error.hint);
        
        // Si no existe el perfil, crear uno por defecto
        if (error.code === 'PGRST116') {
          console.log('Profile not found (PGRST116), creating default profile');
          console.log('Current user email for profile creation:', userEmail);
          
          // Si es el admin conocido, crear perfil de admin
          const isAdminUser = userEmail === 'carlosjchiles@gmail.com' || userEmail === 'admin@learnpro.com';
          console.log('Is admin user?', isAdminUser);
          
          const profileData = {
            user_id: userId,
            full_name: isAdminUser ? 'Carlos J. Chile S.' : (userEmail?.split('@')[0] || 'Usuario'),
            role: isAdminUser ? 'admin' : 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('Creating profile with data:', profileData);
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();
            
          console.log('Profile creation result:', { newProfile, createError });
            
          if (createError) {
            console.error('Error creating profile:', createError);
            console.error('Create error code:', createError.code);
            console.error('Create error message:', createError.message);
            console.error('Create error details:', createError.details);
            return;
          }
          
          setProfile(newProfile as Profile);
          console.log('Profile created and set:', newProfile);
          console.log('=== FETCH PROFILE END (CREATED) ===');
          return;
        } else {
          // Para otros errores, intentar verificar si la tabla existe
          console.log('Non-PGRST116 error, checking if profiles table exists...');
          try {
            const { data: tableData, error: tableError } = await supabase
              .from('profiles')
              .select('count')
              .limit(1);
            
            console.log('Table check result:', { tableData, tableError });
          } catch (tableCheckError) {
            console.error('Table check failed:', tableCheckError);
          }
        }
        console.log('=== FETCH PROFILE END (ERROR) ===');
        return;
      }

      // Type assertion to ensure role matches our UserRole type
      const profileData = data as Profile;
      setProfile(profileData);
      console.log('Profile loaded successfully:', profileData);
      console.log('=== FETCH PROFILE END (SUCCESS) ===');
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      
      if (error.message === 'Profile fetch timeout') {
        console.error('Profile fetch timed out - possible Supabase connectivity issue');
        
        // Intentar crear el perfil directamente si es timeout y es el usuario admin
        if (userData?.user?.email === 'carlosjchiles@gmail.com') {
          console.log('Timeout for admin user, attempting direct profile creation');
          try {
            const profileData = {
              user_id: userId,
              full_name: 'Carlos J. Chile S.',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert(profileData)
              .select()
              .single();
              
            if (!createError && newProfile) {
              setProfile(newProfile as Profile);
              console.log('Admin profile created after timeout:', newProfile);
              console.log('=== FETCH PROFILE END (TIMEOUT RECOVERY) ===');
              return;
            }
          } catch (recoveryError) {
            console.error('Timeout recovery failed:', recoveryError);
          }
        }
        
        // Si es timeout, crear un perfil temporal en memoria para permitir continuar
        console.log('Creating temporary profile for timeout scenario');
        const tempProfile: Profile = {
          id: `temp-${userId}`,
          user_id: userId,
          full_name: userData?.user?.email === 'carlosjchiles@gmail.com' ? 'Carlos J. Chile S.' : (userData?.user?.email?.split('@')[0] || 'Usuario'),
          email: userData?.user?.email || null,
          avatar_url: null,
          role: userData?.user?.email === 'carlosjchiles@gmail.com' ? 'admin' : 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(tempProfile);
        console.log('Temporary profile set:', tempProfile);
      }
      
      console.log('=== FETCH PROFILE END (EXCEPTION) ===');
    }
  };

  const fetchSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Si es 'Not found' (PGRST116), está bien - usuario sin suscripción
        if (error.code === 'PGRST116') {
          console.log('No subscription found for user, setting default');
        } else {
          console.error('Error fetching subscription:', error);
          console.log('Error code:', error.code);
          console.log('Error message:', error.message);
          
          // Si es error 406 o similar (tabla no existe), crear suscripción por defecto
          if (error.code === 'PGRST204' || error.message.includes('406') || error.message.includes('Not Acceptable')) {
            console.log('Subscription table may not exist, setting default subscription');
          }
        }
        
        // Establecer suscripción por defecto en caso de cualquier error
        setSubscription({
          user_id: userId,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
        return;
      }

      // Transform database data to our Subscription interface
      if (data) {
        setSubscription({
          user_id: userId,
          subscribed: data.status === 'active',
          subscription_tier: data.plan_id || null,
          subscription_end: data.ends_at || null
        });
      } else {
        setSubscription({
          user_id: userId,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching subscription:', error);
      // Establecer suscripción por defecto en caso de error inesperado
      setSubscription({
        user_id: userId,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  };

  const ensureAdminProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Ensuring admin profile for user:', user.email);
      
      // Verificar si ya existe el perfil
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (existingProfile) {
        // Si existe pero no es admin, actualizarlo
        if (existingProfile.role !== 'admin') {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role: 'admin',
              full_name: 'Carlos J. Chile S.',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          if (!updateError) {
            setProfile({ ...(existingProfile as Profile), role: 'admin', full_name: 'Carlos J. Chile S.' });
            console.log('Profile updated to admin');
          }
        } else {
          setProfile(existingProfile as Profile);
          console.log('Admin profile already exists');
        }
      } else {
        // Crear nuevo perfil de admin
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: 'Carlos J. Chile S.',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (!createError && newProfile) {
          setProfile(newProfile as Profile);
          console.log('Admin profile created');
        }
      }
    } catch (error) {
      console.error('Error ensuring admin profile:', error);
    }
  };

  useEffect(() => {
    let isLoggingOut = false;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // If we're in the middle of a logout process, don't restore the session
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing all state');
          setSession(null);
          setUser(null);
          setProfile(null);
          setSubscription(null);
          setLoading(false);
          return;
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, setting up session');
          setSession(session);
          setUser(session.user);
          setLoading(false);
          
          // No cargar profile para evitar errores que puedan desloguear
          console.log('Session established successfully for:', session.user.email);
        } else if (!session) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setSubscription(null);
          setLoading(false);
        } else {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        console.log('Existing session found for:', session.user.email);
      } else {
        console.log('No existing session found');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (!error) {
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      
      // Redirigir según el email del usuario
      setTimeout(() => {
        const adminEmails = ['admin@learnpro.com', 'carlosjchiles@gmail.com'];
        if (adminEmails.includes(email.toLowerCase())) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }, 1000);
    }

    return { error };
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear state immediately to prevent UI issues
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
      
      console.log('Local state cleared, calling Supabase signOut...');
      
      // Sign out from all sessions (more aggressive)
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Supabase signOut error:', error);
        // Even with error, continue with cleanup
      }
      
      console.log('Supabase sign out called');
      
      // Clear ALL localStorage items related to auth
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('supabase')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Also clear sessionStorage
      sessionStorage.clear();
      
      console.log('Storage cleared');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      
      console.log('Redirecting to home page...');
      
      // Force reload the entire page to clear any remaining state
      window.location.replace('/');
      
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      
      // Even if there's an error, clear everything and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      setSubscription(null);
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: "Sesión cerrada",
        description: "Sesión cerrada (forzada).",
      });
      
      // Force reload
      window.location.replace('/');
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error) {
      await refreshProfile();
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente.",
      });
    }

    return { error };
  };

  const value: AuthContextType = useMemo(() => ({
    user,
    session,
    profile,
    subscription,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    refreshSubscription,
    ensureAdminProfile,
    isAdmin,
    isInstructor,
    isStudent,
    hasActiveSubscription,
    loading,
  }), [
    user,
    session,
    profile,
    subscription,
    isAdmin,
    isInstructor,
    isStudent,
    hasActiveSubscription,
    loading
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};