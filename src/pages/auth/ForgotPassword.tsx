import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Copy } from 'lucide-react';
import { requestPasswordReset } from '@/lib/localStorage';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { resetUrl: url, error } = requestPasswordReset(email);
      if (error) {
        toast.error(error);
        return;
      }
      setResetUrl(url);
      setSent(true);
      toast.success(`Password reset link sent to ${email}`);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetUrl);
    toast.success('Link copied to clipboard');
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
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-navy mb-2">Forgot Password</h1>
            <p className="text-muted-foreground text-sm">
              {sent
                ? 'Check your email for a password reset link.'
                : 'Enter your email and we’ll send you a reset link.'}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading} variant="default">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Demo mode reset link:</p>
                <div className="flex items-center gap-2">
                  <Input value={resetUrl} readOnly className="text-xs" />
                  <Button type="button" size="icon" variant="outline" onClick={copyLink} aria-label="Copy link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button asChild className="w-full" variant="default">
                  <Link to={resetUrl.replace(window.location.origin, '')}>Open Reset Link</Link>
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail(''); setResetUrl(''); }}>
                Send to a different email
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
