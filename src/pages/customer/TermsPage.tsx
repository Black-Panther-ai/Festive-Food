import React from 'react';

interface TermsPageProps {
  navigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full font-serif">
          Demand Validation Terms
        </span>
        <h1 className="text-3xl font-bold text-stone-900 font-serif">
          Terms of Service & Pre-Order Policy
        </h1>
        <p className="text-xs text-stone-600">Last updated: January 2026</p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-xs space-y-6 text-stone-700 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-serif">1. Zero Advance Payment Policy</h2>
          <p>
            UP Festive Foods operates as a demand-validation marketplace for regional traditional sweets and snacks. All pre-orders placed through our website require <strong>₹0 advance payment</strong>. Placing a pre-order constitutes an expression of interest to purchase fresh batches once prepared.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-serif">2. WhatsApp & Phone Confirmation</h2>
          <p>
            Prior to commissioning our food makers and halwais for fresh preparation, our operations team will contact you via WhatsApp or phone call to verify your availability and delivery preferences. If a customer declines or cannot be reached after multiple attempts, the pre-order may be cancelled without penalty.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-serif">3. Fresh Batch Guarantee & Quality</h2>
          <p>
            All sweets and snacks are freshly prepared in pure desi ghee by verified regional halwai artisans. Because items contain no artificial preservatives, we recommend consuming them within the stated shelf-life and adhering to the recommended storage guidelines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-stone-900 font-serif">4. Cancellation & Modifications</h2>
          <p>
            Customers may modify or cancel their pre-orders free of charge at any time prior to the commencement of kitchen batch cooking by informing our support desk via WhatsApp (+91 6397353920).
          </p>
        </section>
      </div>
    </div>
  );
};
