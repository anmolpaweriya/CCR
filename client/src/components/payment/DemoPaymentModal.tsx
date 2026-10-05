import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CreditCard, CheckCircle2, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface DemoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DemoPaymentModal: React.FC<DemoPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { refreshUser } = useAuth();
  const { showToast } = useNotification();
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('123');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const quickAmounts = [50, 100, 250, 500, 1000];

  const handleQuickSelect = (amt: number) => {
    setAmount(amt);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setAmount(val);
    }
  };

  const handleFillSuccessCard = () => {
    setCardNumber('4242 4242 4242 4242');
  };

  const handleFillFailureCard = () => {
    setCardNumber('4000 0000 0000 0002');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResultStatus('idle');

    try {
      // Small simulated latency for realistic fintech feel
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const res = await api.payments.processDemoPayment({
        credits: amount,
        cardNumber,
      });

      if (res.success) {
        setResultStatus('success');
        setStatusMessage(res.message);
        await refreshUser();
        showToast(res.message, 'success');
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      setResultStatus('failed');
      setStatusMessage(error.message || 'Payment simulation failed.');
      showToast(error.message || 'Demo payment failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setResultStatus('idle');
    setStatusMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="md" title="Top Up Cash Credits">
      {resultStatus === 'success' ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-in zoom-in-75">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
          <p className="text-sm text-slate-600 mb-6">{statusMessage}</p>
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 mb-6">
            Cash Credit balance updated instantly in your wallet.
          </div>
          <Button variant="primary" onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Demo disclaimer banner */}
          <div className="flex items-center gap-2 p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Demo Payment Gateway:</strong> No real money is processed.
            </span>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Credit Amount
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2.5">
              {quickAmounts.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handleQuickSelect(amt)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    amount === amt && !customAmount
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="Or enter custom amount (e.g. 75)"
                value={customAmount}
                onChange={handleCustomChange}
                min="1"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Demo Card Input */}
          <div className="p-4 bg-slate-50/80 border border-slate-200/70 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-500" />
                Simulated Card Details
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleFillSuccessCard}
                  className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium hover:bg-emerald-200 transition-colors"
                >
                  Test Success
                </button>
                <button
                  type="button"
                  onClick={handleFillFailureCard}
                  className="text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-medium hover:bg-rose-200 transition-colors"
                >
                  Test Failure
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="Card Number"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-mono tracking-wider focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                required
              />
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="CVC"
                className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm font-mono focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {resultStatus === 'failed' && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            variant="cash"
            isLoading={isLoading}
            className="w-full"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Pay ${amount} for {amount} Cash Credits
          </Button>
        </form>
      )}
    </Modal>
  );
};
