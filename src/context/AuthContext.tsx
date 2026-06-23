import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  currentPlan?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  token: string | null;
  workspaces: any[];
  activeWorkspace: any;
  googleCalendarToken: string | null;
  googleDriveToken: string | null;
  googleTasksToken: string | null;
  googleKeepToken: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  syncSaaSState: () => Promise<void>;
  updateSaaSBackend: (plan?: string, workspaceId?: number) => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
  connectGoogleCalendar: () => Promise<string | null>;
  connectGoogleDrive: () => Promise<string | null>;
  connectGoogleTasks: () => Promise<string | null>;
  connectGoogleKeep: () => Promise<string | null>;
  disconnectGoogleCalendar: () => void;
  disconnectGoogleDrive: () => void;
  disconnectGoogleTasks: () => void;
  disconnectGoogleKeep: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
].join(' ');

const API_URL = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null);
  
  const [googleCalendarToken, setGoogleCalendarToken] = useState<string | null>(null);
  const [googleDriveToken, setGoogleDriveToken] = useState<string | null>(null);
  const [googleTasksToken, setGoogleTasksToken] = useState<string | null>(null);
  const [googleKeepToken, setGoogleKeepToken] = useState<string | null>(null);

  // Replaces syncWithCloudSQL
  const loadWorkspaceState = async (idToken: string) => {
    try {
      const stateRes = await fetch('/api/auth/state', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (stateRes.ok) {
        const data = await stateRes.json();
        if (data && data.state) {
           const { user: backendUser, activeWorkspace: actWs } = data.state;
           setActiveWorkspace(actWs);
           if (backendUser?.currentPlan) {
             localStorage.setItem('saas_current_plan', backendUser.currentPlan);
           }
        }
      }

      const workRes = await fetch('/api/workspaces', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (workRes.ok) {
        const wdata = await workRes.json();
        setWorkspaces(wdata.workspaces || []);
      }
      
      window.dispatchEvent(new Event('workspaceChanged'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user_profile');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      loadWorkspaceState(storedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuthPayload = async (data: any) => {
    if (data.status === 'success') {
      const { user: userRecord, accessToken } = data;
      const newUser: User = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoUrl,
      };
      
      setUser(newUser);
      setToken(accessToken);
      
      localStorage.setItem('access_token', accessToken);
      if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user_profile', JSON.stringify(newUser));
      
      await loadWorkspaceState(accessToken);
    } else {
      throw new Error(data.error || 'Authentication failed');
    }
  };

  const internalGoogleLogin = useGoogleLogin({
    scope: GOOGLE_SCOPES,
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const beRes = await fetch(`${API_URL}/api/auth/v2/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: tokenResponse.access_token })
        });
        const data = await beRes.json();
        await handleAuthPayload(data);
        
        // Save the token for Workspace APIs
        setGoogleCalendarToken(tokenResponse.access_token);
        setGoogleDriveToken(tokenResponse.access_token);
        setGoogleTasksToken(tokenResponse.access_token);
        setGoogleKeepToken(tokenResponse.access_token);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setLoading(false);
      console.error('Google Login Failed');
    }
  });

  const loginWithGoogle = async () => {
    internalGoogleLogin();
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/v2/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      await handleAuthPayload(data);
    } catch (e: any) {
      setLoading(false);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/v2/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, password: pass, name })
      });
      const data = await res.json();
      await handleAuthPayload(data);
    } catch (e: any) {
      setLoading(false);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      setToken(null);
      setGoogleCalendarToken(null);
      setGoogleDriveToken(null);
      setGoogleTasksToken(null);
      setGoogleKeepToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('active_workspace');
      localStorage.removeItem('saas_current_plan');
      window.dispatchEvent(new Event('workspaceChanged'));
    } catch (error) {
      console.error('Sign-Out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncSaaSState = async () => {
    if (!token) return;
    await loadWorkspaceState(token);
  };

  const updateSaaSBackend = async (plan?: string, workspaceId?: number) => {
    if (!token) return;
    try {
      const res = await fetchWithAuth('/api/auth/state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPlan: plan,
          activeWorkspaceId: workspaceId
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state?.activeWorkspace) {
           setActiveWorkspace(data.state.activeWorkspace);
        }
        if (plan) localStorage.setItem('saas_current_plan', plan);
        window.dispatchEvent(new Event('workspaceChanged'));
      }
    } catch (err) {
      console.error('Failed to update core state on Postgres:', err);
    }
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(`${API_URL}${url}`, { ...options, headers });
  };

  const connectGoogleWorkspace = async () => {
    return new Promise<string | null>((resolve) => {
      // Actually because useGoogleLogin is a hook we can't await it synchronously like signInWithPopup. 
      // But we mapped connectGoogleCalendar to just call internalGoogleLogin. 
      internalGoogleLogin();
      resolve(null);
    });
  };

  const connectGoogleCalendar = connectGoogleWorkspace;
  const connectGoogleDrive = connectGoogleWorkspace;
  const connectGoogleTasks = connectGoogleWorkspace;
  const connectGoogleKeep = connectGoogleWorkspace;

  const disconnectGoogleCalendar = () => setGoogleCalendarToken(null);
  const disconnectGoogleDrive = () => setGoogleDriveToken(null);
  const disconnectGoogleTasks = () => setGoogleTasksToken(null);
  const disconnectGoogleKeep = () => setGoogleKeepToken(null);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      token,
      workspaces,
      activeWorkspace,
      googleCalendarToken,
      googleDriveToken,
      googleTasksToken,
      googleKeepToken,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      syncSaaSState,
      updateSaaSBackend,
      fetchWithAuth,
      connectGoogleCalendar,
      connectGoogleDrive,
      connectGoogleTasks,
      connectGoogleKeep,
      disconnectGoogleCalendar,
      disconnectGoogleDrive,
      disconnectGoogleTasks,
      disconnectGoogleKeep
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
