import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DemoPaymentModal } from '../components/payment/DemoPaymentModal';
import { DemoWithdrawalModal } from '../components/payment/DemoWithdrawalModal';
import {
  Wallet,
  Coins,
  Heart,
  Plus,
  ArrowUpRight,
  Clock,
  ArrowDownLeft,
  ArrowUpRight as ArrowUpRightIcon,
  Filter,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { CreditTransaction } from '../types';

export const WalletPage: React.FC = () => {
  const { wallet, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [creditFilter, setCreditFilter] = useState<'ALL' | 'cash_credit' | 'goodwill_credit'>('ALL');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.wallet.getTransactions({
        creditType: creditFilter !== 'ALL' ? creditFilter : '',
      });
      if (res.success) {
        setTransactions(res.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [creditFilter]);

  const handleRefresh = async () => {
    await refreshUser();
    await loadTransactions();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-7 h-7 text-slate-900" />
            Credit Wallet & Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your two distinct credit balances with full immutable transaction auditability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="cash"
            onClick={() => setIsTopUpOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Top Up Cash Credits
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsWithdrawOpen(true)}
            leftIcon={<ArrowUpRight className="w-4 h-4 text-slate-500" />}
          >
            Withdraw Cash
          </Button>
        </div>
      </div>

      {/* Dual Large Balance Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Cash Credits Large Card */}
        <GlassCard variant="cash" className="p-7 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-blue-600" />
                Cash Credits
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100/90 text-blue-800 border border-blue-200/80">
                Withdrawable: {wallet?.withdrawableCashCredits ?? 0}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold text-blue-950 tracking-tight">
                {wallet?.cashCredits ?? 0}
              </span>
              <span className="text-sm font-semibold text-blue-700">Cash Credits</span>
            </div>

            <p className="text-xs text-blue-900/70 leading-relaxed mb-6">
              Monetary platform credits. Eligible for simulated demo payout and top-up.
            </p>
          </div>

          <div className="pt-4 border-t border-blue-200/60 grid grid-cols-2 gap-2 text-xs text-blue-950">
            <div>
              <span className="text-blue-900/60 block text-[11px]">Total Earned</span>
              <span className="font-bold">+{wallet?.totalCashEarned ?? 0} Credits</span>
            </div>
            <div>
              <span className="text-blue-900/60 block text-[11px]">Total Spent</span>
              <span className="font-bold">-{wallet?.totalCashSpent ?? 0} Credits</span>
            </div>
          </div>
        </GlassCard>

        {/* Goodwill Credits Large Card */}
        <GlassCard variant="goodwill" className="p-7 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-emerald-600 fill-emerald-500/20" />
                Goodwill Credits
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                Non-withdrawable
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-extrabold text-emerald-950 tracking-tight">
                {wallet?.goodwillCredits ?? 0}
              </span>
              <span className="text-sm font-semibold text-emerald-700">Goodwill Credits</span>
            </div>

            <p className="text-xs text-emerald-900/70 leading-relaxed mb-6">
              Community-earned credits awarded for verified voluntary help. Never expires and spent
              first for eligible requests.
            </p>
          </div>

          <div className="pt-4 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-xs text-emerald-950">
            <div>
              <span className="text-emerald-900/60 block text-[11px]">Goodwill Received</span>
              <span className="font-bold">+{wallet?.totalGoodwillEarned ?? 0} GW</span>
            </div>
            <div>
              <span className="text-emerald-900/60 block text-[11px]">Goodwill Spent</span>
              <span className="font-bold">-{wallet?.totalGoodwillSpent ?? 0} GW</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Transactions Ledger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Immutable Credit Ledger</h2>
            <p className="text-xs text-slate-500">
              Every balance change is recorded with exact prior and posterior balances.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreditFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                creditFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setCreditFilter('cash_credit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                creditFilter === 'cash_credit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              Cash Only
            </button>
            <button
              onClick={() => setCreditFilter('goodwill_credit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                creditFilter === 'goodwill_credit'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
            >
              Goodwill Only
            </button>
          </div>
        </div>

        {/* Transactions Table / List */}
        <GlassCard className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading ledger records...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions found in ledger.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => {
                const isAddition = [
                  'TOPUP',
                  'ASSISTANCE_EARNING',
                  'RESOURCE_EARNING',
                  'GOODWILL_REWARD',
                  'REFUND',
                ].includes(tx.transactionType);

                const isGoodwill = tx.creditType === 'goodwill_credit';

                return (
                  <div
                    key={tx._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          isGoodwill
                            ? 'bg-emerald-100 text-emerald-800'
                            : isAddition
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isAddition ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRightIcon className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-900">{tx.description}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{new Date(tx.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-400">
                            Ref: {tx.referenceId?.substring(0, 16)}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div
                        className={`text-sm font-extrabold ${
                          isGoodwill
                            ? 'text-emerald-700'
                            : isAddition
                            ? 'text-blue-700'
                            : 'text-slate-800'
                        }`}
                      >
                        {isAddition ? '+' : '-'}
                        {tx.amount} {isGoodwill ? 'Goodwill' : 'Cash'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Balance: {tx.balanceBefore} → {tx.balanceAfter}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Modals */}
      <DemoPaymentModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={handleRefresh}
      />
      <DemoWithdrawalModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
};
