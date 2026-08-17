import React, { Component, createContext, useContext, useEffect, useState } from 'react';
import {
  ClerkProvider,
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignInButton as ClerkSignInButton,
  SignUpButton as ClerkSignUpButton,
  UserButton as ClerkUserButton,
  useUser,
  useAuth as useClerkAuth
} from '@clerk/clerk-react';
import { CheckCircle2, Flame, Lock, LogOut, Mail, Phone, ShieldCheck, Sparkles, User, UserPlus, X } from 'lucide-react';

// Official Clerk publishable key from environment or active development key
const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
const CLERK_PUBLISHABLE_KEY =
  metaEnv.VITE_CLERK_PUBLISHABLE_KEY ||
  metaEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_bmVhdC13aGFsZS00NjUwLmNsZXJrLmFjY291bnRzLmRldiQ';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  role?: string;
  publicMetadata?: Record<string, any>;
  unsafeMetadata?: Record<string, any>;
}

interface CustomerAuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: CustomerProfile | null;
  clerkUserId: string | null;
  signOut: () => void;
  signIn: (profile: Partial<CustomerProfile>) => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  isSignedIn: false,
  isLoaded: true,
  user: null,
  clerkUserId: null,
  signOut: () => {},
  signIn: () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const useCustomerAuth = () => useContext(CustomerAuthContext);

// Unified Interactive Auth Modal Component (Supports both Sign In and Register)
export const AuthModal: React.FC<{
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (profile: CustomerProfile) => void;
}> = ({ isOpen, initialMode = 'signin', onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() && !phone.trim()) {
        setError('Please enter either your email address or mobile number.');
        return;
      }
    } else {
      if (!email.trim() && !phone.trim()) {
        setError('Please enter your email or registered mobile number.');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const profile: CustomerProfile = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim() || (email.includes('@') ? email.split('@')[0] : 'UP Foodie'),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      };
      onSuccess(profile);
      onClose();
    }, 400);
  };

  const handleQuickDemoCustomer = () => {
    const demoProfile: CustomerProfile = {
      id: 'usr_demo_foodie_kanpur',
      name: 'Kumar Saini',
      email: 'kumarsainipjk@gmail.com',
      phone: '6397353920',
    };
    onSuccess(demoProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-600/60 flex items-center justify-center border border-amber-400/30">
              <Flame className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif leading-tight">UP Festive Foods</h3>
              <p className="text-[11px] text-amber-200">Customer Pre-Order Portal</p>
            </div>
          </div>
          <p className="text-xs text-amber-100/90 mt-2">
            {mode === 'signin'
              ? 'Sign in to manage your festival snacks, view reservations, and track halwai batches.'
              : 'Create your account to pre-order authentic UP festive sweets with ₹0 advance payment.'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-3 text-center transition border-b-2 ${
              mode === 'signin'
                ? 'border-amber-700 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-3 text-center transition border-b-2 ${
              mode === 'signup'
                ? 'border-amber-700 text-amber-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account (Register)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mobile Number (+91)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="63973 53920"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Password {mode === 'signin' ? '' : '(Optional for Pre-Orders)'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white font-semibold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Account</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register & Continue</span>
              </>
            )}
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={handleQuickDemoCustomer}
              className="w-full py-2 px-3 bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-900 rounded-xl text-xs font-medium border border-stone-200 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>1-Click Test Customer Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Fallback Provider when Clerk cannot be reached or is offline
const FallbackBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localUser, setLocalUser] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('up_customer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'signin' | 'signup'>('signin');

  const handleSignIn = (profile: Partial<CustomerProfile>) => {
    const p: CustomerProfile = {
      id: profile.id || `usr-cust-${Date.now()}`,
      name: profile.name || 'UP Festive Foodie',
      email: profile.email || '',
      phone: profile.phone || '',
      imageUrl: profile.imageUrl,
      role: profile.role,
      publicMetadata: profile.publicMetadata,
      unsafeMetadata: profile.unsafeMetadata,
    };
    setLocalUser(p);
    localStorage.setItem('up_customer_profile', JSON.stringify(p));
  };

  const handleSignOut = () => {
    setLocalUser(null);
    localStorage.removeItem('up_customer_profile');
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        isSignedIn: !!localUser,
        isLoaded: true,
        user: localUser,
        clerkUserId: localUser?.id || null,
        signOut: handleSignOut,
        signIn: handleSignIn,
        openAuthModal: (m = 'signin') => {
          setModalMode(m);
          setModalOpen(true);
        },
        closeAuthModal: () => setModalOpen(false),
      }}
    >
      {children}
      <AuthModal
        isOpen={modalOpen}
        initialMode={modalMode}
        onClose={() => setModalOpen(false)}
        onSuccess={(profile) => handleSignIn(profile)}
      />
    </CustomerAuthContext.Provider>
  );
};

interface ClerkErrorBoundaryProps {
  children: React.ReactNode;
}

interface ClerkErrorBoundaryState {
  hasError: boolean;
}

// Error boundary to catch ClerkJS script/network init errors
class ClerkErrorBoundary extends Component<ClerkErrorBoundaryProps, ClerkErrorBoundaryState> {
  override state: ClerkErrorBoundaryState = { hasError: false };

  constructor(props: ClerkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ClerkErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: any) {
    console.warn('[Clerk] Initialization failed, falling back to local auth bridge:', error?.message);
  }

  override render() {
    if (this.state.hasError) {
      return <FallbackBridge>{this.props.children}</FallbackBridge>;
    }
    return this.props.children;
  }
}

// Inner provider that bridges Clerk user data to our customer context
const ClerkBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  let clerkUser: any = null;
  let clerkIsSignedIn = false;
  let clerkIsLoaded = true;
  let clerkSignOut: (() => Promise<void>) | null = null;

  try {
    const userHook = useUser();
    const authHook = useClerkAuth();
    clerkUser = userHook.user;
    clerkIsSignedIn = !!userHook.isSignedIn;
    clerkIsLoaded = !!userHook.isLoaded;
    clerkSignOut = authHook.signOut;
  } catch {
    // Graceful fallback if hooks fail outside provider
  }

  // Local fallback storage for session persistence
  const [localUser, setLocalUser] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem('up_customer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'signin' | 'signup'>('signin');

  const isSignedIn = !!clerkIsSignedIn || !!localUser;

  const currentProfile: CustomerProfile | null = clerkIsSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.firstName || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Food Lover',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
        imageUrl: clerkUser.imageUrl,
        role: (clerkUser.publicMetadata?.role as string) || (clerkUser.unsafeMetadata?.role as string) || (clerkUser as any).role || undefined,
        publicMetadata: clerkUser.publicMetadata,
        unsafeMetadata: clerkUser.unsafeMetadata,
      }
    : localUser;

  const handleSignIn = (profile: Partial<CustomerProfile>) => {
    const p: CustomerProfile = {
      id: profile.id || `usr-cust-${Date.now()}`,
      name: profile.name || 'UP Festive Foodie',
      email: profile.email || '',
      phone: profile.phone || '',
      imageUrl: profile.imageUrl,
      role: profile.role,
      publicMetadata: profile.publicMetadata,
      unsafeMetadata: profile.unsafeMetadata,
    };
    setLocalUser(p);
    localStorage.setItem('up_customer_profile', JSON.stringify(p));
  };

  const handleSignOut = async () => {
    try {
      if (clerkIsSignedIn && clerkSignOut) {
        await clerkSignOut();
      }
    } catch {
      // ignore
    }
    setLocalUser(null);
    localStorage.removeItem('up_customer_profile');
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        isSignedIn,
        isLoaded: clerkIsLoaded,
        user: currentProfile,
        clerkUserId: currentProfile?.id || null,
        signOut: handleSignOut,
        signIn: handleSignIn,
        openAuthModal: (m = 'signin') => {
          setModalMode(m);
          setModalOpen(true);
        },
        closeAuthModal: () => setModalOpen(false),
      }}
    >
      {children}
      <AuthModal
        isOpen={modalOpen}
        initialMode={modalMode}
        onClose={() => setModalOpen(false)}
        onSuccess={(profile) => handleSignIn(profile)}
      />
    </CustomerAuthContext.Provider>
  );
};

export const ClerkWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publishableKey, setPublishableKey] = useState<string>(CLERK_PUBLISHABLE_KEY);

  useEffect(() => {
    // Optionally sync with backend key if available
    fetch('/api/config/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.clerkPublishableKey && data.clerkPublishableKey.startsWith('pk_')) {
          setPublishableKey(data.clerkPublishableKey);
        }
      })
      .catch(() => {});
  }, []);

  const isValidClerkKey = publishableKey && publishableKey.startsWith('pk_');

  if (isValidClerkKey) {
    return (
      <ClerkErrorBoundary>
        <ClerkProvider publishableKey={publishableKey}>
          <ClerkBridge>{children}</ClerkBridge>
        </ClerkProvider>
      </ClerkErrorBoundary>
    );
  }

  // Graceful fallback if no clerk key configured
  return <FallbackBridge>{children}</FallbackBridge>;
};

// Safe UI Components that work seamlessly across Clerk or Fallback modes
export const SignInButton: React.FC<{
  mode?: 'modal' | 'redirect';
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { openAuthModal } = useCustomerAuth();
  return (
    <span onClick={() => openAuthModal('signin')} className={`inline-block cursor-pointer ${className || ''}`}>
      {children || (
        <button type="button" className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-700 text-white hover:bg-amber-800 transition">
          Sign In
        </button>
      )}
    </span>
  );
};

export const SignUpButton: React.FC<{
  mode?: 'modal' | 'redirect';
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const { openAuthModal } = useCustomerAuth();
  return (
    <span onClick={() => openAuthModal('signup')} className={`inline-block cursor-pointer ${className || ''}`}>
      {children || (
        <button type="button" className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 transition">
          Create Account
        </button>
      )}
    </span>
  );
};

export const UserButton: React.FC<{ className?: string }> = ({ className }) => {
  const { user, signOut } = useCustomerAuth();
  const [dropdown, setDropdown] = useState(false);

  if (!user) return null;

  return (
    <div className={`relative inline-block ${className || ''}`}>
      <button
        onClick={() => setDropdown(!dropdown)}
        className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-bold shadow-xs hover:ring-2 hover:ring-amber-500 transition"
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
        ) : (
          user.name?.charAt(0).toUpperCase() || 'U'
        )}
      </button>

      {dropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in duration-150">
          <div className="px-3.5 py-2 border-b border-stone-100">
            <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
            <p className="text-[10px] text-stone-500 truncate">{user.email || user.phone}</p>
          </div>
          <button
            onClick={() => {
              setDropdown(false);
              signOut();
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const SignedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn } = useCustomerAuth();
  if (!isSignedIn) return null;
  return <>{children}</>;
};

export const SignedOut: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn } = useCustomerAuth();
  if (isSignedIn) return null;
  return <>{children}</>;
};

export { useUser };
