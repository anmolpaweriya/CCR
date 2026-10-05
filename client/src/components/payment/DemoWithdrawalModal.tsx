import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ArrowUpRight, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface DemoWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DemoWithdrawalModal: React.FC<DemoWithdrawalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { wallet, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const [amount, setAmount] = useState<string>('50');
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
  const [payoutDetails, setPayoutDetails] = useState<string>('demo.user@okaxis');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const withdrawable = wallet?.withdrawableCashCredits || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid withdrawal amount.');
      setIsLoading(false);
      return;
    }

    if (parsedAmount > withdrawable) {
      setErrorMsg(`Cannot withdraw more than available ${withdrawable} Cash Credits.`);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.withdrawals.request({
        amount: parsedAmount,
        payoutMethod,
        payoutDetails,
      });

      if (res.success) {
        setIsSuccess(true);
        await refreshUser();
        showToast('Demo withdrawal requested! Pending admin review.', 'success');
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to request withdrawal.');
      showToast(error.message || 'Withdrawal failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="md" title="Withdraw Cash Credits">
      {isSuccess ? (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 animate-in zoom-in-75">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Withdrawal Submitted</h3>
          <p className="text-sm text-slate-600 mb-6">
            Your request to withdraw {amount} Cash Credits via {payoutMethod} has been recorded. An
            administrator can approve it in the governance panel.
          </p>
          <Button variant="primary" onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Disclaimer */}
          <div className="flex items-center gap-2 p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Demo Withdrawal:</strong> No real money will be transferred.
            </span>
          </div>

          {/* Balance card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Available Withdrawable</div>
              <div className="text-lg font-bold text-slate-900">{withdrawable} Cash Credits</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-600 font-semibold">Goodwill Credits: {wallet?.goodwillCredits || 0}</div>
              <div className="text-[11px] text-slate-400">Non-withdrawable</div>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Withdraw Amount (Cash Credits)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={withdrawable}
              min="1"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900 font-semibold"
              required
            />
          </div>

          {/* Payout method */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Demo Payout Method
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setPayoutMethod('UPI')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  payoutMethod === 'UPI'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                UPI ID (Demo)
              </button>
              <button
                type="button"
                onClick={() => setPayoutMethod('BANK_TRANSFER')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  payoutMethod === 'BANK_TRANSFER'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Bank Transfer (Demo)
              </button>
            </div>

            <input
              type="text"
              value={payoutDetails}
              onChange={(e) => setPayoutDetails(e.target.value)}
              placeholder={
                payoutMethod === 'UPI' ? 'e.g. user@okhdfcbank' : 'Account: 12345678 - IFSC: DEMO001'
              }
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-800"
              required
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full"
            leftIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            Request Demo Payout
          </Button>
        </form>
      )}
    </Modal>
  );
};
