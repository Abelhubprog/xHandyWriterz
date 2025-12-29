import { useState } from 'react';

interface PaymentButtonProps {
  amount: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({
  amount,
  onSuccess,
  onError,
  className = '',
  children,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Here we'll simulate a payment process
      // In a real application, this would integrate with your payment provider
      const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card' },
        { id: 'bank', name: 'Bank Transfer' }
      ];

      // Show payment method selection
      const method = window.confirm(
        'Choose a payment method:\n\n' +
        paymentMethods.map((m, i) => `${i + 1}. ${m.name}`).join('\n')
      );

      if (!method) {
        throw new Error('Payment cancelled');
      }

      // Simulate successful payment
      setTimeout(() => {
        setLoading(false);
        onSuccess?.();
      }, 1500);

    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Payment failed'));
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? 'Processing...' : `Pay £${amount}`}
      </button>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {children}
    </div>
  );
}