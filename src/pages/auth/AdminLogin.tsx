import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { signIn, getUserRole, signOutLocal, seedDefaultAdmin, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '@/lib/localStorage';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  useEffect(() => {
    seedDefaultAdmin();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { user, error } = signIn(email, password);
      if (error || !user) {
        toast.error(error || 'Failed to login');
        return;
      }
      const role = getUserRole(user.id);
      if (role !== 'admin') {
        signOutLocal();
        toast.error('This login is for administrators only.');
        return;
      }
      refreshAuth();
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 rounded-full bg-gradient-cyan flex items-center justify-center mb-4">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-navy mb-2">Admin Login</h1>
            <p className="text-muted-foreground">Restricted access for administrators</p>
          </div>

          <div className="bg-muted/50 border border-border rounded-md p-3 mb-6 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Demo admin credentials:</p>
            <p>Email: <span className="font-mono">{DEFAULT_ADMIN_EMAIL}</span></p>
            <p>Password: <span className="font-mono">{DEFAULT_ADMIN_PASSWORD}</span></p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sibms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/auth/forgot-password" className="text-xs text-primary font-semibold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading} variant="hero">
              {loading ? 'Signing in...' : 'Sign In as Admin'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Not an admin?{' '}
              <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                User login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
