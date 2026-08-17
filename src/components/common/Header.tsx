import {
  Clock,
  Flame,
  HelpCircle,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useCustomerAuth, SignInButton, SignUpButton, UserButton } from '../../context/ClerkWrapper';
import { useCart } from '../../context/CartContext';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const { totalItems } = useCart();
  const { isSignedIn, user } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'All Snacks & Sweets', path: '/products' },
    { label: 'How Pre-Order Works', path: '/how-it-works' },
    { label: 'About UP Foods', path: '/about' },
    { label: 'Track Pre-Order', path: '/track-order' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-amber-900/10 transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-orange-800 text-amber-50 px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
        <span>
          <strong>Demand Validation MVP:</strong> Order traditional UP sweets & snacks with <strong>₹0 advance payment</strong>. Direct maker batches.
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <button
            id="brand-logo-btn"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-900/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-amber-950 block leading-tight font-serif">
                UP Festive Foods
              </span>
              <span className="text-[10px] sm:text-xs text-amber-800 font-medium tracking-wide block uppercase">
                Traditional Sweets & Snacks
              </span>
            </div>
          </button>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Gujiya, Mathri, Thekua, Laddoo..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              id="nav-products-btn"
              onClick={() => navigate('/products')}
              className={`text-sm font-medium transition ${
                currentPath.startsWith('/products') ? 'text-amber-700 font-semibold' : 'text-stone-700 hover:text-amber-800'
              }`}
            >
              Explore Snacks
            </button>
            <button
              id="nav-how-it-works-btn"
              onClick={() => navigate('/how-it-works')}
              className={`text-sm font-medium transition ${
                currentPath === '/how-it-works' ? 'text-amber-700 font-semibold' : 'text-stone-700 hover:text-amber-800'
              }`}
            >
              How It Works
            </button>
            <button
              id="nav-track-btn"
              onClick={() => navigate('/track-order')}
              className={`text-sm font-medium flex items-center gap-1.5 transition ${
                currentPath === '/track-order' ? 'text-amber-700 font-semibold' : 'text-stone-700 hover:text-amber-800'
              }`}
            >
              <Truck className="w-4 h-4 text-amber-600" />
              Track Order
            </button>
            <button
              id="nav-admin-btn"
              onClick={() => navigate('/admin')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 transition flex items-center gap-1"
              title="Access Admin Operations Console"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Customer Account / Clerk Sign In */}
            {isSignedIn ? (
              <button
                id="header-account-btn"
                onClick={() => navigate('/account')}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border transition flex items-center gap-2 ${
                  currentPath === '/account'
                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline">My Orders</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <SignInButton mode="modal">
                  <button
                    id="header-signin-btn"
                    className="text-xs font-semibold px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 transition flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-stone-600" />
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    id="header-register-btn"
                    className="hidden md:flex text-xs font-semibold px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition items-center gap-1"
                  >
                    <span>Register</span>
                  </button>
                </SignUpButton>
              </div>
            )}

            {/* Pre-Order Cart Button */}
            <button
              id="header-preorder-cart-btn"
              onClick={() => navigate('/preorder')}
              className="relative flex items-center gap-2 bg-amber-700 hover:bg-amber-800 active:scale-95 text-white px-3.5 sm:px-4 py-2 rounded-full font-medium text-sm shadow-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Pre-Order Cart</span>
              {totalItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-300 text-amber-950 text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-700 hover:text-amber-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3 pt-1">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Gujiya, Mathri, Thekua..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FDFBF7] px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  currentPath === link.path ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{link.label}</span>
              </button>
            ))}

            <button
              onClick={() => {
                navigate('/account');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                currentPath === '/account' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <User className="w-4 h-4 text-amber-700" />
              <span>{isSignedIn ? 'My Account & Pre-Orders' : 'Sign In / My Account'}</span>
            </button>

            <button
              onClick={() => {
                navigate('/admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 text-stone-700 hover:bg-stone-100 border-t border-stone-200/60 mt-1"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Admin Operations Console</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
