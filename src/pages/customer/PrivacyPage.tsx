import React from 'react';

interface PrivacyPageProps {
  navigate: (path: string) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-serif">
          Customer Privacy
        </span>
        <h1 className="text-3xl font-bold text-stone-900 font-serif">
          Privacy & Data Protection Policy
        </h1>
        <p className="text-xs text-stone-600">Last updated: January 2026</p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-serif">1. Information We Collect</h2>
          <p>
            When you place a ₹0 pre-order on UP Festive Foods, we collect your name, mobile phone number, delivery address (including PIN code), and optional email address strictly for pre-order verification, batch scheduling, and doorstep dispatch.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-serif">2. Use of Your Contact Information</h2>
          <p>
            Your mobile number is used to coordinate delivery schedules via WhatsApp and direct voice call. We do not sell, rent, or lease your personal information to third-party telemarketers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-serif">3. Security</h2>
          <p>
            All pre-order and customer records are protected with industry-standard cryptographic storage and administrative role-based access control.
          </p>
        </section>
      </div>
    </div>
  );
};
