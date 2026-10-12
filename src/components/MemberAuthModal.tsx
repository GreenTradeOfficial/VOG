import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Heart,
  Eye,
  EyeOff,
} from 'lucide-react';
import { VogLogo } from './VogLogo';
import { useChurch } from '../context/ChurchContext';
import {
  registerMemberWithEmail,
  loginMemberWithEmail,
  loginMemberWithGoogle,
  sendMemberPasswordReset,
} from '../services/memberAuthService';

interface MemberAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { showToast } = useChurch();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setErrorMsg(null);
    setResetSent(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const profile = await loginMemberWithGoogle();
      showToast(
        `Welcome to VOG, ${profile.displayName || 'Beloved Member'}!`,
        'success'
      );
      onClose();
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled.');
      } else {
        setErrorMsg(err.message || 'Could not complete Google Sign-in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address to receive password reset link.');
        return;
      }
      setIsLoading(true);
      try {
        await sendMemberPasswordReset(email.trim());
        setResetSent(true);
        showToast('Password reset link sent to your email!', 'info');
      } catch (err: any) {
        console.error('Password reset error:', err);
        if (err.code === 'auth/user-not-found') {
          setErrorMsg('No member account found with this email address.');
        } else {
          setErrorMsg(err.message || 'Failed to send reset email.');
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your full name or preferred member name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const profile = await registerMemberWithEmail(
          email.trim(),
          password,
          displayName.trim(),
          phoneNumber.trim()
        );
        showToast(
          `Welcome to the VOG Church Family, ${profile.displayName}!`,
          'success'
        );
        onClose();
      } else {
        const profile = await loginMemberWithEmail(email.trim(), password);
        showToast(
          `Welcome back, ${profile.displayName || 'Beloved Member'}!`,
          'success'
        );
        onClose();
      }
    } catch (err: any) {
      console.error('Member auth error:', err);
      let friendly = err.message || 'An error occurred during authentication.';
      if (err.code === 'auth/email-already-in-use') {
        friendly = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendly = 'Incorrect email or password. Please verify your details.';
      } else if (err.code === 'auth/user-not-found') {
        friendly = 'No account found with this email. Would you like to create one?';
      } else if (err.code === 'auth/weak-password') {
        friendly = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        friendly = 'Please enter a valid email address.';
      }
      setErrorMsg(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-auth-title"
    >
      {/* Backdrop click dismissal */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Church Gradient & Crest */}
        <div className="p-6 bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <VogLogo size="sm" />
            <div>
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
                Vessel of Grace Christian Center
              </span>
              <h2 id="member-auth-title" className="text-xl font-extrabold text-white font-serif-church">
                {mode === 'login'
                  ? 'Member Portal Login'
                  : mode === 'signup'
                  ? 'Join Church Fellowship'
                  : 'Reset Account Password'}
              </h2>
            </div>
          </div>

          <p className="text-xs text-blue-100/90 leading-relaxed">
            {mode === 'login'
              ? 'Sign in to access your saved favorites, daily devotion history, and personal activity log.'
              : mode === 'signup'
              ? 'Create your member account to save spiritual bookmarks and track your faith journey across devices.'
              : 'Enter your registered email address to receive password reset instructions.'}
          </p>

          {/* Mode Switch Tabs */}
          {mode !== 'forgot' && (
            <div className="mt-4 grid grid-cols-2 p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  handleResetForm();
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-blue-950 shadow-sm'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  handleResetForm();
                }}
                className={`py-2 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-blue-950 shadow-sm'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Password Reset Sent Confirmation */}
          {resetSent ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif-church">
                Reset Instructions Sent
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                We've sent a password reset link to <strong className="text-slate-900">{email}</strong>. Please check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  handleResetForm();
                }}
                className="mt-2 px-5 py-2.5 bg-blue-900 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition-colors"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Google Fast Authentication Button */}
              {mode !== 'forgot' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 shadow-xs transition-all active:scale-98 disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider relative">
                      or with email
                    </span>
                  </div>
                </div>
              )}

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name / Preferred Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Sister Grace Somina"
                        className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-medium"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+234 ..."
                        className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-medium"
                      />
                    </div>
                  </div>
                )}

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            handleResetForm();
                          }}
                          className="text-[11px] font-bold text-blue-900 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-950/20 hover:shadow-lg transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'login'
                          ? 'Sign In to Member Portal'
                          : mode === 'signup'
                          ? 'Register Member Account'
                          : 'Send Reset Link'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Forgot Mode Back to Login */}
              {mode === 'forgot' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      handleResetForm();
                    }}
                    className="text-xs font-bold text-blue-900 hover:underline"
                  >
                    Back to Member Sign In
                  </button>
                </div>
              )}
            </>
          )}

          {/* Spiritual Security & Confidentiality Badge */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure Firebase Cloud Authentication & Pastoral Data Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
