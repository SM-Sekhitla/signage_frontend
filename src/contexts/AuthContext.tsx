import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getCurrentUser, getUserRole, signOutLocal } from '@/lib/localStorage';

type UserRole = 'admin' | 'installer' | 'client';

interface LocalUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: LocalUser | null;
  session: any;
  userRole: UserRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadAuth = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      const role = getUserRole(currentUser.id) as UserRole | null;
      setUserRole(role);
    } else {
      setUserRole(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAuth();
  }, []);

  const refreshAuth = () => {
    loadAuth();
  };

  const signOut = async () => {
    signOutLocal();
    setUser(null);
    setUserRole(null);
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session: user, userRole, loading, signOut, refreshAuth }}>
      {children}
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
