import { ArrowLeft, CheckCircle2, Key, Lock, Mail, Shield, Sparkles, UserCheck } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCustomerAuth, SignInButton } from '../../context/ClerkWrapper';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { login, loginWithClerk, isAuthenticated } = useAuth();
  const { isSignedIn, user: clerkUser, clerkUserId } = useCustomerAuth();
  const [email, setEmail] = useState('kumarsainipjk@gmail.com');
  const [password, setPassword] = useState('Admin@UPFoods2025');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to admin
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  // If signed in via Clerk, automatically check if email is authorized admin
  React.useEffect(() => {
    const attemptClerkAdminAuth = async () => {
      if (isSignedIn && clerkUser?.email && !isAuthenticated) {
        setLoading(true);
        try {
          const res = await loginWithClerk(clerkUser.email, clerkUser.name, clerkUserId || undefined);
          if (res.success) {
            navigate('/admin');
          }
        } catch {
          // ignore
        } finally {
          setLoading(false);
        }
      }
    };

    attemptClerkAdminAuth();
  }, [isSignedIn, clerkUser, clerkUserId, isAuthenticated, loginWithClerk, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Invalid email or password.');
    }
  };

  const handleQuickLogin = async (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
    setLoading(true);

    const result = await login(roleEmail, rolePass);
    setLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to UP Festive Foods Store</span>
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-600 text-white font-serif font-bold text-xl shadow-md">
            UP
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Operator Console Login
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Demand Validation, WhatsApp Confirmations & Halwai Dispatch
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-stone-200/90 shadow-sm space-y-6">
          {/* Clerk Admin Auth Button */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-serif">
              <UserCheck className="w-4 h-4 text-amber-700" />
              <span>Clerk Admin Sign In</span>
            </div>
            <p className="text-[11px] text-stone-600">
              Sign in with your verified Clerk administrator account (<strong>kumarsainipjk@gmail.com</strong>):
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="w-full mt-1 py-2 px-3 bg-white hover:bg-stone-50 border border-amber-300 text-amber-950 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Authorize with Clerk</span>
              </button>
            </SignInButton>
          </div>

          {/* Quick Demo Logins Banner */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-amber-900/10 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-serif">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Standard Admin Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('kumarsainipjk@gmail.com', 'Admin@UPFoods2025')}
                className="p-2.5 text-left bg-white hover:bg-amber-50 border border-stone-200 rounded-xl transition text-[11px]"
              >
                <span className="font-bold text-stone-900 block truncate">👑 Kumar Saini (Admin)</span>
                <span className="text-[10px] text-stone-500 block truncate">kumarsainipjk@gmail.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('kumarsainipjk@gmail.com', 'Admin@UPFoods2025')}
                className="p-2.5 text-left bg-white hover:bg-amber-50 border border-stone-200 rounded-xl transition text-[11px]"
              >
                <span className="font-bold text-stone-900 block truncate">📞 Phone (6397353920)</span>
                <span className="text-[10px] text-stone-500 block truncate">Quick Sign-In</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kumarsainipjk@gmail.com"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Log In to Operations Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
