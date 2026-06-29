import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

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

  // Sync profile details to Local Database
  const syncWithCloudSQL = async (currentUser: User) => {
    try {
      const idToken = await currentUser.getIdToken(true);
      setToken(idToken);

      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName,
          picture: currentUser.photoURL
        })
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Backend synchronization failed: ${errText}`);
      }

      // Fetch user SaaS profile state from SQLite
      const stateRes = await fetch('/api/auth/state', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (stateRes.ok) {
        const data = await stateRes.json();
        if (data && data.state) {
          const { user, activeWorkspace } = data.state;
          setActiveWorkspace(activeWorkspace);
          if (user?.currentPlan) {
            localStorage.setItem('saas_current_plan', user.currentPlan);
          }
        }
      }

      // Fetch all workspaces
      const workRes = await fetch('/api/workspaces', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (workRes.ok) {
        const wdata = await workRes.json();
        setWorkspaces(wdata.workspaces || []);
      }
      
      // Notify listeners in UI
      window.dispatchEvent(new Event('workspaceChanged'));
      
    } catch (err) {
      console.error('Error syncing user details with Local Database backend:', err);
    }
  };

  const syncSaaSState = async () => {
    if (!user) return;
    await syncWithCloudSQL(user);
  };
  
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    let idToken = token;
    
    // If we don't have a token, try to get one
    if (!idToken && user) {
        idToken = await user.getIdToken();
        setToken(idToken);
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${idToken}`
    };

    let response = await fetch(url, { ...options, headers });

    // If unauthorized, token might be expired. Refresh and retry once.
    if (response.status === 401 && user) {
      console.log("Token expired. Refreshing...");
      const newToken = await user.getIdToken(true);
      setToken(newToken);
      
      const retryHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      };
      response = await fetch(url, { ...options, headers: retryHeaders });
    }

    // Safety net: check if response is HTML
    const originalJson = response.json.bind(response);
    response.json = async () => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const text = await response.text();
        console.error(`[fetchWithAuth] Received HTML for ${url}:`, text.substring(0, 200));
        throw new Error(`Expected JSON but received HTML for ${url}`);
      }
      return originalJson();
    };

    return response;
  };

  const updateSaaSBackend = async (plan?: string, workspaceId?: number) => {
    if (!user) return;
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
      console.error('Failed to update core state on SQLite:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncWithCloudSQL(currentUser);
      } else {
        setToken(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Periodic token refresh (every 30 minutes)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        const newToken = await user.getIdToken(true);
        setToken(newToken);
        console.log("IdToken refreshed periodically");
      } catch (e) {
        console.error("Periodic token refresh failed:", e);
      }
    }, 30 * 60 * 1000); 

    return () => clearInterval(interval);
  }, [user]);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleCalendarToken(credential.accessToken);
        setGoogleDriveToken(credential.accessToken);
        setGoogleTasksToken(credential.accessToken);
        setGoogleKeepToken(credential.accessToken);
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleCalendarToken(credential.accessToken);
        setGoogleDriveToken(credential.accessToken); // Share token since scopes are unified
        setGoogleTasksToken(credential.accessToken);  // Share token since scopes are unified
        setGoogleKeepToken(credential.accessToken);   // Share token since scopes are unified
        return credential.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      throw error;
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleDriveToken(credential.accessToken);
        setGoogleCalendarToken(credential.accessToken); // Share token since scopes are unified
        setGoogleTasksToken(credential.accessToken);   // Share token since scopes are unified
        setGoogleKeepToken(credential.accessToken);    // Share token since scopes are unified
        return credential.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Error connecting Google Drive:', error);
      throw error;
    }
  };

  const connectGoogleTasks = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleTasksToken(credential.accessToken);
        setGoogleCalendarToken(credential.accessToken); // Share
        setGoogleDriveToken(credential.accessToken);    // Share
        setGoogleKeepToken(credential.accessToken);     // Share
        return credential.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Error connecting Google Tasks:', error);
      throw error;
    }
  };

  const connectGoogleKeep = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleKeepToken(credential.accessToken);
        setGoogleCalendarToken(credential.accessToken); // Share
        setGoogleDriveToken(credential.accessToken);    // Share
        setGoogleTasksToken(credential.accessToken);    // Share
        return credential.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Error connecting Google Keep:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Email Sign-In failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(result.user, { displayName: name });
    } catch (error) {
      console.error('Registration failed:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setGoogleCalendarToken(null);
      setGoogleDriveToken(null);
      setGoogleTasksToken(null);
      setGoogleKeepToken(null);
      localStorage.removeItem('active_workspace');
      localStorage.removeItem('saas_current_plan');
      window.dispatchEvent(new Event('workspaceChanged'));
    } catch (error) {
      console.error('Sign-Out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const disconnectGoogleCalendar = () => {
    setGoogleCalendarToken(null);
  };

  const disconnectGoogleDrive = () => {
    setGoogleDriveToken(null);
  };

  const disconnectGoogleTasks = () => {
    setGoogleTasksToken(null);
  };

  const disconnectGoogleKeep = () => {
    setGoogleKeepToken(null);
  };

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
