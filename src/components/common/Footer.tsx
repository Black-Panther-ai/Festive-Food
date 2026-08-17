import { CheckCircle2, Flame, Heart, Mail, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import React from 'react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-amber-950/40">
      {/* Brand & Value Promise */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Flame className="w-6 h-6 text-amber-200" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-serif">
                UP Festive Foods
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              Demand-validation marketplace connecting authentic local halwais and makers across Kanpur, Lucknow, Varanasi, and Gorakhpur with sweet lovers year-round.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-amber-300">
              <span className="bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> ₹0 Advance Pre-Orders
              </span>
              <span className="bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Verified Food Makers
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4 font-serif">
              Explore Specialties
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/products?category=sweets')}
                  className="hover:text-amber-400 transition"
                >
                  Traditional Gujiya & Laddoo
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products?category=namkeen')}
                  className="hover:text-amber-400 transition"
                >
                  Khasta Mathri & Namak Para
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products?category=festival-specials')}
                  className="hover:text-amber-400 transition"
                >
                  Purvanchal Gur Thekua
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products?category=regional-specialties')}
                  className="hover:text-amber-400 transition"
                >
                  Awadhi Balushahi & Petha
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products')}
                  className="hover:text-amber-400 transition text-amber-300 font-medium"
                >
                  View All Products →
                </button>
              </li>
            </ul>
          </div>

          {/* How & Legal */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4 font-serif">
              Information & Help
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-amber-400 transition">
                  How Pre-Order Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/track-order')} className="hover:text-amber-400 transition">
                  Track Pre-Order Status
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-amber-400 transition">
                  About Our Mission
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-amber-400 transition">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/privacy')} className="hover:text-amber-400 transition">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-amber-400 transition">
                  Terms & Cancellation
                </button>
              </li>
            </ul>
          </div>

          {/* Maker & Hub Info */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-4 font-serif">
              Operations Hub
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Birhana Road / Civil Lines, Kanpur, Uttar Pradesh 208001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="https://wa.me/916397353920" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition">
                  +91 6397353920 (WhatsApp Ops)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:kumarsainipjk@gmail.com" className="hover:text-amber-300 transition">
                  kumarsainipjk@gmail.com
                </a>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/admin')}
                  className="text-xs text-amber-400/90 underline hover:text-amber-300"
                >
                  Admin Operations Login →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-6 border-t border-stone-800 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} UP Festive Foods. All rights reserved. Traditional flavors made with care.</p>
          <div className="flex items-center gap-4">
            <span className="text-stone-400">Demand Validation Platform</span>
            <span>•</span>
            <span>Uttar Pradesh, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
