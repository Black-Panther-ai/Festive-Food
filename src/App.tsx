import React, { useEffect, useState } from 'react';
import { Footer } from './components/common/Footer';
import { Header } from './components/common/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClerkWrapper, useCustomerAuth } from './context/ClerkWrapper';
import { CartProvider } from './context/CartContext';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminSellersPage } from './pages/admin/AdminSellersPage';
import { AdminSlotsPage } from './pages/admin/AdminSlotsPage';
import { AboutPage } from './pages/customer/AboutPage';
import { AccountPage } from './pages/customer/AccountPage';
import { ContactPage } from './pages/customer/ContactPage';
import { HomePage } from './pages/customer/HomePage';
import { HowItWorksPage } from './pages/customer/HowItWorksPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';
import { PreOrderPage } from './pages/customer/PreOrderPage';
import { PrivacyPage } from './pages/customer/PrivacyPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { ProductsPage } from './pages/customer/ProductsPage';
import { TermsPage } from './pages/customer/TermsPage';
import { TrackOrderPage } from './pages/customer/TrackOrderPage';
import { ShieldAlert } from 'lucide-react';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname + window.location.search || '/'
  );
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'products' | 'sellers' | 'slots' | 'reviews'>('dashboard');
  const [unauthorizedNotice, setUnauthorizedNotice] = useState<string | null>(null);

  const { isAuthenticated, isLoading: authLoading, user: adminUser, loginWithClerk } = useAuth();
  const { isSignedIn, isLoaded: clerkLoaded, user: customerUser, clerkUserId } = useCustomerAuth();
  const [isVerifyingClerkAdmin, setIsVerifyingClerkAdmin] = useState(false);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getCleanPath = (path: string) => {
    let clean = path || '/';
    if (clean.includes('#')) {
      clean = clean.split('#')[1] || '/';
    }
    const [pathPart, queryPart] = clean.split('?');
    let normalized = (pathPart || '/').replace(/\/+/g, '/').toLowerCase();
    
    // Normalize trailing slash (unless root '/')
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    // Strip common GitHub Pages base folder prefix if present
    const knownRoutes = ['products', 'preorder', 'pre-order', 'order-success', 'account', 'track-order', 'how-it-works', 'about', 'contact', 'terms', 'privacy', 'admin', 'cart', 'checkout'];
    for (const route of knownRoutes) {
      const idx = normalized.indexOf(`/${route}`);
      if (idx > 0) {
        normalized = normalized.substring(idx);
        break;
      }
    }

    return { pathName: normalized, queryString: queryPart || '' };
  };

  const { pathName } = getCleanPath(currentPath);

  // Protect Admin Routes via Clerk Session & Server-Side Admin Role Verification
  useEffect(() => {
    if (!pathName.startsWith('/admin') || pathName === '/admin/login') {
      return;
    }

    if (authLoading) return;

    // If already verified admin session in AuthContext
    if (isAuthenticated && (adminUser?.role === 'ADMIN' || adminUser?.role === 'OPERATOR')) {
      return;
    }

    // Check if user has a valid Clerk session
    if (isSignedIn && customerUser?.email) {
      setIsVerifyingClerkAdmin(true);

      // Check Clerk user metadata for 'admin' role
      const hasClerkAdminRole =
        customerUser.role?.toLowerCase() === 'admin' ||
        customerUser.publicMetadata?.role?.toLowerCase() === 'admin' ||
        customerUser.unsafeMetadata?.role?.toLowerCase() === 'admin';

      // Perform server-side check against authorized admin credentials
      loginWithClerk(customerUser.email, customerUser.name, clerkUserId || undefined)
        .then((res) => {
          setIsVerifyingClerkAdmin(false);
          if (res.success || hasClerkAdminRole) {
            // Authorized admin session granted
          } else {
            // Unauthorized Clerk user -> redirect to home page
            setUnauthorizedNotice('Access restricted: Your account does not have administrator privileges.');
            navigate('/');
          }
        })
        .catch(() => {
          setIsVerifyingClerkAdmin(false);
          setUnauthorizedNotice('Access restricted: Unable to verify administrator authorization.');
          navigate('/');
        });
    } else if (!authLoading) {
      // Unauthenticated visitor attempting to access protected admin route -> redirect to home page
      setUnauthorizedNotice('Administrator sign-in required. Redirected to home page.');
      navigate('/');
    }
  }, [pathName, isAuthenticated, authLoading, isSignedIn, customerUser, clerkUserId, adminUser]);

  // Route: Admin
  if (pathName.startsWith('/admin')) {
    if (pathName === '/admin/login') {
      if (isAuthenticated) {
        navigate('/admin');
        return null;
      }
      return <AdminLoginPage navigate={navigate} />;
    }

    if (authLoading || isVerifyingClerkAdmin) {
      return (
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-9 h-9 border-3 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-stone-700">Verifying administrator credentials...</p>
            <p className="text-[11px] text-stone-400">Checking Clerk session and administrative access</p>
          </div>
        </div>
      );
    }

    // If authenticated admin, render Admin Dashboard Layout
    if (isAuthenticated) {
      return (
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={setAdminTab}
          navigate={navigate}
        >
          {adminTab === 'dashboard' && <AdminDashboardPage navigate={navigate} onSelectTab={setAdminTab} />}
          {adminTab === 'orders' && <AdminOrdersPage navigate={navigate} />}
          {adminTab === 'products' && <AdminProductsPage navigate={navigate} />}
          {adminTab === 'sellers' && <AdminSellersPage navigate={navigate} />}
          {adminTab === 'slots' && <AdminSlotsPage navigate={navigate} />}
        </AdminLayout>
      );
    }

    // If unauthorized, return null while redirecting to home page
    return null;
  }

  // Route: Customer Page Resolution
  let renderPage = <HomePage navigate={navigate} />;

  if (pathName === '/' || pathName === '') {
    renderPage = <HomePage navigate={navigate} />;
  } else if (
    pathName === '/preorder' ||
    pathName === '/pre-order' ||
    pathName === '/cart' ||
    pathName === '/checkout' ||
    pathName === '/products/preorder' ||
    pathName === '/products/pre-order'
  ) {
    renderPage = <PreOrderPage navigate={navigate} />;
  } else if (pathName === '/products') {
    renderPage = <ProductsPage navigate={navigate} />;
  } else if (pathName.startsWith('/products/')) {
    const rawSlug = pathName.replace('/products/', '').trim();
    if (rawSlug === 'preorder' || rawSlug === 'pre-order' || rawSlug === 'cart' || rawSlug === 'checkout') {
      renderPage = <PreOrderPage navigate={navigate} />;
    } else if (!rawSlug || rawSlug === 'undefined' || rawSlug === 'null') {
      renderPage = <ProductsPage navigate={navigate} />;
    } else {
      renderPage = <ProductDetailPage navigate={navigate} slug={rawSlug} />;
    }
  } else if (pathName.startsWith('/order-success')) {
    const parts = pathName.split('/');
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = parts[2] || urlParams.get('orderNumber') || '';
    renderPage = <OrderSuccessPage navigate={navigate} orderNumber={orderNumber} />;
  } else if (pathName === '/account') {
    renderPage = <AccountPage navigate={navigate} />;
  } else if (pathName === '/track-order') {
    renderPage = <TrackOrderPage navigate={navigate} />;
  } else if (pathName === '/how-it-works') {
    renderPage = <HowItWorksPage navigate={navigate} />;
  } else if (pathName === '/about') {
    renderPage = <AboutPage navigate={navigate} />;
  } else if (pathName === '/contact') {
    renderPage = <ContactPage navigate={navigate} />;
  } else if (pathName === '/terms') {
    renderPage = <TermsPage navigate={navigate} />;
  } else if (pathName === '/privacy') {
    renderPage = <PrivacyPage navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {unauthorizedNotice && (
        <div className="bg-amber-900 text-amber-50 px-4 py-2.5 text-xs flex items-center justify-between border-b border-amber-800 shadow-sm animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{unauthorizedNotice}</span>
          </div>
          <button
            onClick={() => setUnauthorizedNotice(null)}
            className="text-amber-300 hover:text-white text-xs font-semibold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}
      <Header currentPath={pathName} navigate={navigate} />
      <main className="flex-1">{renderPage}</main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ClerkWrapper>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ClerkWrapper>
  );
}
