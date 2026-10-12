import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserX,
  LogOut,
  ArrowLeft,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { VogLogo } from './VogLogo';
import { useChurch } from '../context/ChurchContext';
import {
  loginAdminWithCredentials,
  loginAdminWithGoogle,
  ADMIN_EMAILS,
} from '../services/memberAuthService';

interface AdminLoginGatewayProps {
  onSuccess?: () => void;
  isUnauthorizedMember?: boolean;
}

export const AdminLoginGateway: React.FC<AdminLoginGatewayProps> = ({
  onSuccess,
  isUnauthorizedMember = false,
}) => {
  const {
    currentUser,
    setActiveTab,
    signOutAdminUser,
    signInWithGoogleAdmin,
    showToast,
  } = useChurch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both administrative email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loginAdminWithCredentials(email.trim(), password);
      showToast('Welcome Administrator! Staff privileges enabled.', 'success');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithGoogleAdmin();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in as a normal member but tried to enter admin portal
  if (isUnauthorizedMember && currentUser) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-rose-200 overflow-hidden">
          <div className="bg-gradient-to-r from-rose-900 to-red-950 text-white p-6 sm:p-8 text-center relative">
            <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-3 border border-rose-300/30">
              <UserX className="w-8 h-8 text-rose-200" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-serif-church">
              Administrative Access Restricted
            </h2>
            <p className="text-xs text-rose-200 mt-1 max-w-md mx-auto">
              Vessel of Grace Christian Center · Senior Pastoral Administration Portal
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Active Account:</span>
                <span className="font-bold text-slate-900">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Account Role:</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-[10px]">
                  Church Member
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Permission Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 font-extrabold text-[10px]">
                  Non-Administrative
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Why am I seeing this screen?</p>
                  <p className="text-amber-800 mt-0.5">
                    Your account is registered as a church member. Church sermons, devotionals, events, broadcasts, and member records are protected and can only be altered by authorized church pastoral staff.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => signOutAdminUser()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out to Log In with Administrator Account</span>
              </button>

              <button
                onClick={() => setActiveTab('home')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Congregation Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Gateway for unauthenticated users
  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Luxury Navy/Gold Header */}
        <div className="bg-gradient-to-br from-[#0B2545] via-[#133E87] to-[#0A1128] text-white p-6 sm:p-8 text-center relative border-b border-amber-400/30">
          <div className="w-16 h-16 mx-auto bg-blue-900/90 rounded-2xl flex items-center justify-center p-2 mb-3 border-2 border-amber-400/50 shadow-lg">
            <VogLogo size="md" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              Restricted Pastoral Area
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif-church text-white">
            Church Administrator Portal
          </h2>
          <p className="text-xs text-blue-200/90 mt-1 max-w-xs mx-auto">
            Vessel of Grace Christian Center (VOG) · Senior Pastor West Somina
          </p>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleAdminEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Staff / Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vogcenter.org"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-950 to-blue-900 hover:from-blue-900 hover:to-blue-800 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>Authenticate & Enter Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
              Or Authenticate with
            </span>
          </div>

          <button
            onClick={handleAdminGoogleLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
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
            <span>Google Authorized Pastor Sign-In</span>
          </button>

          {/* Privacy & Pastoral Security Note */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Shield className="w-3.5 h-3.5" />
              <span>Strict Church Access Policy</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Standard visitor or congregation registrations cannot access this area. Unauthorized sign-in attempts will be denied by server-side Firestore security rules.
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs font-bold text-slate-500 hover:text-blue-900 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Congregation Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
