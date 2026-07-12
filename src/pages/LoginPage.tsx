import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { Truck, Lock, Mail, Sparkles, UserCheck } from 'lucide-react';
import emailjs from '@emailjs/browser';
import type { Driver } from '../data/mockData';

interface LoginPageProps {
  onLogin: (user: { email: string; role: 'manager' | 'driver'; driverId?: string; name: string }) => void;
  drivers: Driver[];
  onChangePassword: (email: string, newPass: string) => boolean;
  managerPasswordVal: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLogin, 
  drivers, 
  onChangePassword,
  managerPasswordVal 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // First-Time Change state (for driver/manager initial login)
  const [tempUser, setTempUser] = useState<{ email: string; role: 'manager' | 'driver'; driverId?: string; name: string } | null>(null);
  const [isFirstTimeOpen, setIsFirstTimeOpen] = useState(false);
  const [firstTimePass, setFirstTimePass] = useState('');
  const [firstTimeConfirm, setFirstTimeConfirm] = useState('');
  const [firstTimeError, setFirstTimeError] = useState('');

  // Forgot Password request state
  const [isForgotRequestOpen, setIsForgotRequestOpen] = useState(false);
  const [forgotRequestEmail, setForgotRequestEmail] = useState('');
  const [forgotRequestError, setForgotRequestError] = useState('');
  const [forgotRequestSuccess, setForgotRequestSuccess] = useState('');



  // Passcode reset view (unlocked only via email verification link)
  const [resetTargetEmail, setResetTargetEmail] = useState<string | null>(null);
  const [resetPass, setResetPass] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetEmailParam = params.get('resetEmail');
    if (resetEmailParam) {
      setResetTargetEmail(resetEmailParam);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    setTimeout(() => {
      const emailLower = email.toLowerCase().trim();
      const passTrim = password.trim();

      // Manager Auth
      if (emailLower === 'manager@transitops.com') {
        if (passTrim === managerPasswordVal) {
          onLogin({
            email: emailLower,
            role: 'manager',
            name: 'Ops Manager'
          });
          setIsLoading(false);
          return;
        } else {
          setError('Invalid manager credentials.');
          setIsLoading(false);
          return;
        }
      }

      // Driver Auth
      const matchedDriver = drivers.find(d => {
        const idMatch = emailLower.includes(d.id.toLowerCase());
        const nameEmail = d.name.toLowerCase().replace(/\s+/g, '.');
        const nameMatch = emailLower.includes(nameEmail);
        return idMatch || nameMatch;
      });

      if (matchedDriver) {
        if (matchedDriver.isDeleted) {
          setError('User credentials not found.');
          setIsLoading(false);
          return;
        }

        if (matchedDriver.isBlocked) {
          setError(`Driver account has been suspended. Reason: ${matchedDriver.blockedReason || 'Admin block'}`);
          setIsLoading(false);
          return;
        }

        if (passTrim === (matchedDriver.password || 'driver123')) {
          const userObj = {
            email: emailLower,
            role: 'driver' as const,
            driverId: matchedDriver.id,
            name: matchedDriver.name
          };

          if (matchedDriver.needsPasswordChange) {
            setTempUser(userObj);
            setIsFirstTimeOpen(true);
            setIsLoading(false);
          } else {
            onLogin(userObj);
          }
          return;
        } else {
          setError('Invalid driver password.');
          setIsLoading(false);
          return;
        }
      }

      setError('User credentials not found.');
      setIsLoading(false);
    }, 800);
  };

  const handleFirstTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFirstTimeError('');

    if (firstTimePass.length < 5) {
      setFirstTimeError('New passcode must be at least 5 characters.');
      return;
    }
    if (firstTimePass !== firstTimeConfirm) {
      setFirstTimeError('Passcodes do not match.');
      return;
    }

    if (tempUser) {
      const ok = onChangePassword(tempUser.email, firstTimePass);
      if (ok) {
        setIsFirstTimeOpen(false);
        onLogin(tempUser);
      } else {
        setFirstTimeError('Error resetting passcode.');
      }
    }
  };

  const handleForgotRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotRequestError('');
    setForgotRequestSuccess('');

    const targetEmail = forgotRequestEmail.toLowerCase().trim();

    // Validate email exists in system
    const isManager = targetEmail === 'manager@transitops.com';
    const matchedDriver = drivers.find(d => {
      const nameEmail = d.name.toLowerCase().replace(/\s+/g, '.') + '@transitops.com';
      return targetEmail === nameEmail || targetEmail === d.id.toLowerCase() + '@transitops.com';
    });

    if (!isManager && !matchedDriver) {
      setForgotRequestError('Email address is not registered in our depot registry.');
      return;
    }

    // Send real email using EmailJS
    const resetLink = `${window.location.origin}/?resetEmail=${encodeURIComponent(targetEmail)}`;
    
    const templateParams = {
      to_email: targetEmail,
      reset_link: resetLink,
    };

    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service',
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'default_template',
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'default_key'
    ).then(() => {
      setForgotRequestSuccess('Passcode recovery instructions have been successfully dispatched to your email address.');
      setForgotRequestEmail('');
    }).catch((err) => {
      console.error('EmailJS Error:', err);
      setForgotRequestError('Failed to send email. Check your EmailJS configuration.');
    });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetTargetEmail) return;

    if (resetPass.length < 5) {
      setResetError('Password must be at least 5 characters.');
      return;
    }
    if (resetPass !== resetConfirm) {
      setResetError('Passwords do not match.');
      return;
    }

    const ok = onChangePassword(resetTargetEmail, resetPass);
    if (ok) {
      setSuccess(`Passcode updated successfully for ${resetTargetEmail}! You can now login.`);
      setResetTargetEmail(null);
      setResetPass('');
      setResetConfirm('');
      setIsForgotRequestOpen(false);
    } else {
      setResetError('Error changing passcode.');
    }
  };


  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 transition-colors duration-300 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/login_hero.png')" }}
    >
      {/* Background overlay to soften the image details and increase contrast */}
      <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-xs pointer-events-none" />

      {/* 1. MASTER LOGIN VIEWPORT CONTAINER (Neat glass design overlay on top of background) */}
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 rounded-3xl shadow-2xl overflow-hidden p-8 relative z-10">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-brand-green/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-brand-info/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-brand-green flex items-center justify-center text-white shadow-xl shadow-brand-green/20">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">TransitOps</h2>
            <p className="text-xs text-brand-green font-bold uppercase tracking-wider mt-1">Smart Fleet Portal</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* Conditional view: First-time change vs Verified change vs Standard login */}
          {isFirstTimeOpen ? (
            <form onSubmit={handleFirstTimeSubmit} className="space-y-4">
              <div className="p-3 bg-brand-warning/15 text-brand-warning border border-brand-warning/20 rounded-xl text-xs font-semibold leading-relaxed">
                🛡️ First-Time Security Compliance: Please define a custom private passcode for your profile.
              </div>

              {firstTimeError && (
                <div className="p-3 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 rounded-xl text-xs font-semibold">
                  {firstTimeError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-bold uppercase">Define New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="password"
                    required
                    placeholder="New password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green"
                    value={firstTimePass}
                    onChange={(e) => setFirstTimePass(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-bold uppercase">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green"
                    value={firstTimeConfirm}
                    onChange={(e) => setFirstTimeConfirm(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-2.5 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl"
              >
                Set Passcode & Authorize
              </Button>
            </form>
          ) : resetTargetEmail ? (
            // Verified password reset screen (only unlocked via email link)
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="p-3 bg-brand-info/10 text-brand-info border border-brand-info/20 rounded-xl text-xs font-semibold">
                🔑 Recovering credentials for:<br />
                <strong className="text-text-primary font-mono">{resetTargetEmail}</strong>
              </div>

              {resetError && (
                <div className="p-3 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 rounded-xl text-xs font-semibold">
                  {resetError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-bold uppercase">Define New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="password"
                    required
                    placeholder="New password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green"
                    value={resetPass}
                    onChange={(e) => setResetPass(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-bold uppercase">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green"
                    value={resetConfirm}
                    onChange={(e) => setResetConfirm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button variant="outline" type="button" className="w-1/3" onClick={() => setResetTargetEmail(null)}>
                  Back
                </Button>
                <Button type="submit" className="w-2/3 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl">
                  Save Passcode
                </Button>
              </div>
            </form>
          ) : (
            // Standard login form
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 rounded-xl text-xs font-semibold text-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-brand-success/10 text-brand-success border border-brand-success/20 rounded-xl text-xs font-semibold text-center">
                  {success}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-text-secondary font-bold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="email"
                    required
                    placeholder="name@transitops.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-text-secondary font-bold uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotRequestError('');
                      setForgotRequestSuccess('');
                      setIsForgotRequestOpen(true);
                    }}
                    className="text-xs text-brand-green font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="h-4.5 w-4.5" />
                    <span>Authenticate Portal</span>
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="p-4 rounded-xl bg-bg-secondary/40 border border-border-primary/50 space-y-2 text-xs">
            <span className="font-bold text-text-primary flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-brand-green animate-pulse" />
              Test Portal Logins
            </span>
            <div className="space-y-1 text-text-secondary">
              <p>
                <strong>Dispatch Manager:</strong><br />
                Email: <code className="bg-bg-secondary px-1 py-0.5 rounded font-mono text-[10px]">manager@transitops.com</code><br />
                Password: <code className="bg-bg-secondary px-1 py-0.5 rounded font-mono text-[10px]">{managerPasswordVal}</code>
              </p>
              <p className="border-t border-border-primary/40 pt-1.5 mt-1">
                <strong>Fleet Drivers:</strong><br />
                Email: <code className="bg-bg-secondary px-1 py-0.5 rounded font-mono text-[10px]">alex.mercer@transitops.com</code><br />
                Password: <code className="bg-bg-secondary px-1 py-0.5 rounded font-mono text-[10px]">driver123</code> <span className="text-[10px] text-brand-info font-bold">(requires passcode reset on first login)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECURE EMAIL REQUEST DIALOG */}
      <Dialog
        isOpen={isForgotRequestOpen}
        onClose={() => setIsForgotRequestOpen(false)}
        title="Passcode Reset coordinate Dispatcher"
        description="Verify your identity. A secure passcode modification link will be sent to your inbox."
      >
        <form onSubmit={handleForgotRequestSubmit} className="space-y-4">
          {forgotRequestError && (
            <div className="p-3 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 rounded-xl text-xs font-semibold text-center">
              {forgotRequestError}
            </div>
          )}

          {forgotRequestSuccess && (
            <div className="p-3 bg-brand-success/10 text-brand-success border border-brand-success/20 rounded-xl text-xs font-semibold leading-relaxed">
              {forgotRequestSuccess}
            </div>
          )}

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs text-text-secondary font-bold uppercase">Account Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="email"
                required
                placeholder="e.g. manager@transitops.com"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-primary bg-bg-primary/50 text-sm text-text-primary focus:outline-none focus:border-brand-green"
                value={forgotRequestEmail}
                onChange={(e) => setForgotRequestEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-border-primary/45">
            <Button variant="outline" type="button" onClick={() => setIsForgotRequestOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-brand-green text-white font-bold">
              Dispatch Verification Email
            </Button>
          </div>
        </form>
      </Dialog>



    </div>
  );
};
