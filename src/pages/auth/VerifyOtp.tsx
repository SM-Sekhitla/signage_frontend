import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { verifyOtpAndCreateAccount, resendSignupOtp, getPendingSignup } from '@/lib/localStorage';

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/auth/signup');
      return;
    }
    const pending = getPendingSignup(email);
    if (!pending) {
      toast.error('No pending verification found. Please sign up again.');
      navigate('/auth/signup');
      return;
    }
    const update = () => {
      const remaining = Math.max(0, Math.floor((pending.otp_expires_at - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { user, error, expired } = verifyOtpAndCreateAccount(email, otp);
      if (error || !user) {
        toast.error(error || 'Verification failed');
        if (expired) setSecondsLeft(0);
        setOtp('');
        return;
      }
      toast.success('Account verified successfully! Please sign in.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setResending(true);
    try {
      const { otp: newOtp, error } = resendSignupOtp(email);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success(`A new OTP has been sent to ${email}.`);
      toast.info(`Demo OTP: ${newOtp}`, { duration: 10000 });
      const pending = getPendingSignup(email);
      if (pending) {
        setSecondsLeft(Math.floor((pending.otp_expires_at - Date.now()) / 1000));
      }
      setOtp('');
    } finally {
      setResending(false);
    }
  };

  const expired = secondsLeft <= 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <Link to="/auth/signup" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign Up
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground text-sm">
              Enter the 6-digit code sent to
              <br />
              <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2 flex flex-col items-center">
              <Label htmlFor="otp" className="sr-only">OTP</Label>
              <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={expired}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="text-center text-sm">
              {expired ? (
                <span className="text-destructive font-medium">OTP has expired. Please request a new one.</span>
              ) : (
                <span className="text-muted-foreground">
                  OTP expires in <span className="font-semibold text-foreground">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                </span>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading || expired || otp.length !== 6} variant="default">
              {loading ? 'Verifying...' : 'Verify Account'}
            </Button>

            <Button type="button" variant="outline" className="w-full" onClick={handleResend} disabled={resending}>
              {resending ? 'Sending...' : 'Resend OTP'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
