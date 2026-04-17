import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Check, X, Eye, EyeOff, KeyRound } from 'lucide-react';
import { getPasswordReset, resetPasswordWithToken } from '@/lib/localStorage';

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`';]/.test(p) },
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing reset link.');
      return;
    }
    const entry = getPasswordReset(token);
    if (!entry) {
      setTokenError('Invalid reset link.');
    } else if (entry.used) {
      setTokenError('This reset link has already been used.');
    } else if (Date.now() > entry.expires_at) {
      setTokenError('This reset link has expired. Please request a new one.');
    } else {
      setEmail(entry.email);
    }
  }, [token]);

  const allRulesPass = useMemo(
    () => passwordRules.every((r) => r.test(password)),
    [password]
  );
  const passwordsMatch = password.length > 0 && password === confirm;
  const canSubmit = allRulesPass && passwordsMatch && !loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { error } = resetPasswordWithToken(token, password);
      if (error) {
        toast.error(error);
        return;
      }
      setSuccess(true);
      toast.success('New password has been created successfully');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              {success ? <Check className="h-6 w-6 text-primary" /> : <KeyRound className="h-6 w-6 text-primary" />}
            </div>
            <h1 className="text-3xl font-bold text-navy mb-2">
              {success ? 'Password Updated' : 'Reset Password'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {success
                ? 'New password has been created successfully.'
                : email
                ? <>Create a new password for <span className="font-semibold text-foreground">{email}</span></>
                : 'Create a new password for your account.'}
            </p>
          </div>

          {tokenError ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {tokenError}
              </div>
              <Button asChild variant="default" className="w-full">
                <Link to="/auth/forgot-password">Request a new link</Link>
              </Button>
            </div>
          ) : success ? (
            <Button onClick={() => navigate('/auth/login')} className="w-full" size="lg" variant="default">
              Return to Login
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirm.length > 0 && !passwordsMatch && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>

              {password && (
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-1.5">
                  <p className="text-sm font-medium text-foreground mb-2">Password requirements:</p>
                  {passwordRules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2 text-sm">
                        {passed ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span className={passed ? 'text-foreground' : 'text-muted-foreground'}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={!canSubmit} variant="default">
                {loading ? 'Updating...' : 'Change Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
