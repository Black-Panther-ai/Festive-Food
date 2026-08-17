import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Clock,
  Package,
  PhoneCall,
  Sparkles,
  Truck,
  XCircle
} from 'lucide-react';
import React from 'react';
import { ConfirmationStatus, OrderStatus } from '../../types';

interface OrderTimelineProps {
  orderStatus: OrderStatus;
  confirmationStatus: ConfirmationStatus;
  history?: Array<{
    status: OrderStatus;
    date: string;
    message?: string;
  }>;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ orderStatus, confirmationStatus, history = [] }) => {
  const steps: Array<{
    key: OrderStatus;
    label: string;
    desc: string;
    icon: React.ElementType;
  }> = [
    {
      key: 'NEW',
      label: 'Pre-Order Received',
      desc: 'Your ₹0 pre-order request has been logged in our system.',
      icon: Clock,
    },
    {
      key: 'CONTACTED',
      label: 'Customer Contacted',
      desc: 'Admin reached out via WhatsApp/Call for batch details.',
      icon: PhoneCall,
    },
    {
      key: 'CONFIRMED',
      label: 'Order Confirmed',
      desc: 'Pre-order confirmed. Food maker slot reserved.',
      icon: CheckCircle2,
    },
    {
      key: 'PREPARING',
      label: 'Maker Preparing Fresh',
      desc: 'Traditional halwai crafting your batch in pure desi ghee.',
      icon: ChefHat,
    },
    {
      key: 'READY',
      label: 'Ready & Packed',
      desc: 'Hygienically packaged with airtight freshness seal.',
      icon: Package,
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: 'Out For Delivery',
      desc: 'Handed over to local delivery partner for your slot.',
      icon: Truck,
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      desc: 'Enjoy authentic Uttar Pradesh festive flavours!',
      icon: Sparkles,
    },
  ];

  const isCancelled = orderStatus === 'CANCELLED' || orderStatus === 'REJECTED' || confirmationStatus === 'DECLINED';
  const isExpired = orderStatus === 'EXPIRED';

  // Find index of current status
  const getStatusIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'NEW':
        return 0;
      case 'CONTACTED':
        return 1;
      case 'CONFIRMED':
        return 2;
      case 'PREPARING':
        return 3;
      case 'READY':
        return 4;
      case 'OUT_FOR_DELIVERY':
        return 5;
      case 'DELIVERED':
        return 6;
      default:
        return 0;
    }
  };

  const currentIndex = getStatusIndex(orderStatus);

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
          <XCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-rose-900 font-serif">Pre-Order Cancelled / Declined</h4>
        <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
          This pre-order request was cancelled or declined. No payment was charged as pre-orders are ₹0. You are welcome to explore other fresh batches.
        </p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-amber-900 font-serif">Pre-Order Expired</h4>
        <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
          This pre-order deadline or delivery window has passed without confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
      {steps.map((step, idx) => {
        const isPast = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const isFuture = idx > currentIndex;
        const Icon = step.icon;

        // Find relevant history event
        const histEvent = history.find((h) => h.status === step.key);

        return (
          <div key={step.key} className="relative flex items-start gap-4">
            {/* Step Marker */}
            <div
              className={`absolute -left-6 sm:-left-8 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                isPast
                  ? 'bg-emerald-600 text-white'
                  : isCurrent
                  ? 'bg-amber-600 text-white ring-4 ring-amber-100 animate-pulse'
                  : 'bg-white border-2 border-stone-300 text-stone-400'
              }`}
            >
              <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>

            {/* Step Body */}
            <div className="flex-1 bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4
                  className={`text-sm sm:text-base font-bold font-serif ${
                    isCurrent ? 'text-amber-900' : isPast ? 'text-emerald-950' : 'text-stone-500'
                  }`}
                >
                  {step.label}
                </h4>
                {histEvent && (
                  <span className="text-[11px] text-stone-500 font-mono">
                    {new Date(histEvent.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{step.desc}</p>
              {histEvent?.message && histEvent.message !== `Order status updated to ${step.key}` && (
                <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded border border-amber-200/60">
                  {histEvent.message}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
