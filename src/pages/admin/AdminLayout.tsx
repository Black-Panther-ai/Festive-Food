import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronRight,
  ExternalLink,
  Layers,
  LogOut,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  UtensilsCrossed
} from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  currentTab: 'dashboard' | 'orders' | 'products' | 'sellers' | 'slots' | 'reviews';
  onSelectTab: (tab: 'dashboard' | 'orders' | 'products' | 'sellers' | 'slots' | 'reviews') => void;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  navigate,
  children,
}) => {
  const { user, logout } = useAuth();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Demand Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'orders' as const,
      label: 'Pre-Orders Queue',
      icon: PackageCheck,
      badge: null,
    },
    {
      id: 'products' as const,
      label: 'Dishes & Items',
      icon: UtensilsCrossed,
      badge: null,
    },
    {
      id: 'sellers' as const,
      label: 'UP Halwai Makers',
      icon: Store,
      badge: null,
    },
    {
      id: 'slots' as const,
      label: 'Delivery Slots',
      icon: Calendar,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand / Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectTab('dashboard')}
                className="flex items-center gap-2.5 text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 font-serif font-bold flex items-center justify-center text-sm shadow-xs">
                  UP
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base tracking-tight text-stone-100">
                      UP Festive Foods
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      Ops Console
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400">Demand Validation & Fulfillment Engine</p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-xs font-semibold'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Exit Storefront & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Prominent Exit to Customer Store Button */}
              <button
                id="exit-admin-to-store-btn"
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-500/40 px-3.5 py-1.5 rounded-xl transition shadow-xs"
                title="Exit Admin and return to customer storefront"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit to Store</span>
              </button>

              <div className="hidden md:flex flex-col items-end border-l border-stone-800 pl-3">
                <span className="text-xs font-semibold text-stone-200">{user?.name || 'Admin'}</span>
                <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider">
                  {user?.role || 'ADMIN'}
                </span>
              </div>

              {/* Explicit Logout Button */}
              <button
                id="admin-logout-btn"
                onClick={() => setShowExitConfirm(true)}
                className="flex items-center gap-1 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-xl transition border border-stone-700"
                title="Log out from admin console"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Navigation bar */}
        <div className="lg:hidden border-t border-stone-800 px-2 py-2 overflow-x-auto flex space-x-1 scrollbar-none items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition ${
                  isActive
                    ? 'bg-amber-600 text-white font-medium'
                    : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs whitespace-nowrap text-amber-300 bg-amber-900/60 font-semibold border border-amber-700/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Store</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-stone-900 text-stone-500 text-[11px] py-4 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>UP Festive Foods Admin Panel • Demand Validation & Batch Scheduling Engine</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Customer Storefront</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="text-stone-400 hover:text-stone-200 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </footer>

      {/* Logout / Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Exit Admin Panel?
              </h3>
              <p className="text-xs text-stone-600">
                You can return to the customer store or log out from your administrator session.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  navigate('/');
                }}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go to Customer Storefront</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  handleLogout();
                }}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-stone-500" />
                <span>Log Out Completely</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-2 text-stone-400 hover:text-stone-600 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
