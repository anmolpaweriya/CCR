import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  ShieldCheck,
  Users,
  Coins,
  Heart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  HandHelping,
  Package,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'USERS' | 'WITHDRAWALS' | 'DISPUTES' | 'AUDIT_LOGS' | 'GOODWILL'
  >('OVERVIEW');

  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [disputesList, setDisputesList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [goodwillTxs, setGoodwillTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User credit adjust modal state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(20);
  const [adjustType, setAdjustType] = useState<'cash_credit' | 'goodwill_credit'>('cash_credit');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Withdrawal rejection modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [sRes, uRes, wRes, dRes, aRes, gRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getWithdrawals(),
        api.admin.getDisputes(),
        api.admin.getAuditLogs(),
        api.admin.getGoodwillTransactions(),
      ]);

      if (sRes.success) {
        setStats(sRes.stats);
        setChartData(sRes.chartData || []);
      }
      if (uRes.success) setUsersList(uRes.users || []);
      if (wRes.success) setWithdrawalsList(wRes.withdrawals || []);
      if (dRes.success) setDisputesList(dRes.disputes || []);
      if (aRes.success) setAuditLogs(aRes.logs || []);
      if (gRes.success) setGoodwillTxs(gRes.transactions || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center rounded-3xl glass-card max-w-md mx-auto my-12">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 mt-2">
          You do not have permissions to access the governance panel. Please sign in with the demo
          admin account (<code>admin@ccr.demo</code> / <code>Password123!</code>).
        </p>
      </div>
    );
  }

  // Handle user suspension
  const handleToggleSuspend = async (userId: string) => {
    try {
      const res = await api.admin.toggleSuspendUser(userId, 'Administrative security action');
      if (res.success) {
        showToast(res.message, 'success');
        await loadAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  // Handle credit adjustment
  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustReason) {
      showToast('A mandatory reason is required for credit adjustments', 'error');
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await api.admin.adjustCredits(selectedUser._id, {
        creditType: adjustType,
        amount: adjustAmount,
        reason: adjustReason,
      });

      if (res.success) {
        showToast(res.message, 'success');
        setIsAdjustModalOpen(false);
        setAdjustReason('');
        await loadAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to adjust credits', 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  // Handle withdrawal approval
  const handleApproveWithdrawal = async (id: string) => {
    try {
      const res = await api.admin.handleWithdrawal(id, { action: 'APPROVE' });
      if (res.success) {
        showToast('Demo withdrawal approved!', 'success');
        await loadAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval failed', 'error');
    }
  };

  // Handle withdrawal rejection
  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal || !rejectionReason) {
      showToast('A rejection reason is required', 'error');
      return;
    }

    try {
      const res = await api.admin.handleWithdrawal(selectedWithdrawal._id, {
        action: 'REJECT',
        reason: rejectionReason,
      });
      if (res.success) {
        showToast('Withdrawal rejected and credits refunded.', 'info');
        setIsRejectModalOpen(false);
        setRejectionReason('');
        await loadAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Rejection failed', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 mb-2">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            ADMINISTRATIVE OVERSIGHT
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Governance & Economic Ledger
          </h1>
        </div>

        <div className="text-xs text-slate-500 font-medium bg-white px-3 py-1.5 rounded-xl border border-slate-200">
          Signed in as <strong>{user?.name}</strong> (Admin)
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'OVERVIEW', label: 'Overview & Charts' },
          { id: 'USERS', label: `Users (${usersList.length})` },
          { id: 'WITHDRAWALS', label: `Withdrawals (${withdrawalsList.length})` },
          { id: 'DISPUTES', label: `Disputes (${disputesList.length})` },
          { id: 'GOODWILL', label: `Goodwill Activity (${goodwillTxs.length})` },
          { id: 'AUDIT_LOGS', label: `Audit Trail (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <GlassCard className="p-5">
              <div className="text-xs text-slate-400 font-semibold mb-1">Total Users</div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.totalUsers || 0}</div>
              <div className="text-[11px] text-emerald-600 mt-1">
                {stats?.activeUsers || 0} Active
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-xs text-blue-600 font-semibold mb-1">Cash in Circulation</div>
              <div className="text-2xl font-extrabold text-blue-950">
                {stats?.cashCirculation || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Platform Cash Credits</div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-xs text-emerald-600 font-semibold mb-1">
                Goodwill in Circulation
              </div>
              <div className="text-2xl font-extrabold text-emerald-950">
                {stats?.goodwillCirculation || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Non-withdrawable GW</div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="text-xs text-purple-600 font-semibold mb-1">Pending Withdrawals</div>
              <div className="text-2xl font-extrabold text-purple-950">
                {stats?.pendingWithdrawals || 0}
              </div>
              <div className="text-[11px] text-amber-600 mt-1">Requires review</div>
            </GlassCard>
          </div>

          {/* Recharts Analytics */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Community Economic Activity (Last 7 Days)
                </h3>
                <p className="text-xs text-slate-500">
                  Cash Credits spent vs Goodwill Credits earned in the hyperlocal network.
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorGoodwill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cashSpent"
                    name="Cash Credits Spent"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCash)"
                  />
                  <Area
                    type="monotone"
                    dataKey="goodwillEarned"
                    name="Goodwill Credits Earned"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGoodwill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <div
                  key={u._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{u.name}</span>
                        {u.role === 'ADMIN' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                            ADMIN
                          </span>
                        )}
                        {u.isSuspended && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                            SUSPENDED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {u.email} • {u.locationZone} • {u.reputationScore}% Trust Rating
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-1.5 font-mono">
                        <span className="text-blue-700 font-semibold">
                          Cash: {u.wallet?.cashCredits ?? 0}
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          Goodwill: {u.wallet?.goodwillCredits ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(u);
                        setIsAdjustModalOpen(true);
                      }}
                    >
                      Adjust Credits
                    </Button>

                    <Button
                      variant={u.isSuspended ? 'goodwill' : 'danger'}
                      size="sm"
                      onClick={() => handleToggleSuspend(u._id)}
                    >
                      {u.isSuspended ? 'Reactivate' : 'Suspend'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'WITHDRAWALS' && (
        <div className="space-y-4">
          <GlassCard className="p-0 overflow-hidden">
            {withdrawalsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No demo withdrawal requests.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {withdrawalsList.map((w) => (
                  <div
                    key={w._id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge status={w.status} size="sm" />
                        <span className="text-xs font-semibold text-slate-500">
                          {new Date(w.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {w.user?.name} ({w.user?.email})
                      </h4>
                      <div className="text-xs text-slate-600 mt-1 font-mono">
                        Payout: {w.payoutMethod} — {w.payoutDetails}
                      </div>
                      {w.adminReason && (
                        <div className="text-xs text-slate-500 mt-1 italic">
                          Admin note: {w.adminReason}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-blue-900">
                          {w.amount} Cash Credits
                        </div>
                        <div className="text-[11px] text-slate-400">Cash Credits only</div>
                      </div>

                      {w.status === 'REQUESTED' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="goodwill"
                            size="sm"
                            onClick={() => handleApproveWithdrawal(w._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(w);
                              setIsRejectModalOpen(true);
                            }}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'DISPUTES' && (
        <div className="space-y-4">
          <GlassCard className="p-0 overflow-hidden">
            {disputesList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active community disputes.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {disputesList.map((d) => (
                  <div key={d._id} className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge status={d.status} size="sm" />
                      <span className="text-xs font-mono text-slate-400">
                        Amount: {d.creditAmount} Credits
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Requester: {d.requester?.name} vs Contributor: {d.contributor?.name}
                    </div>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <strong>Reason:</strong> {d.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* Goodwill Activity Tab */}
      {activeTab === 'GOODWILL' && (
        <div className="space-y-4">
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {goodwillTxs.map((gw) => (
                <div key={gw._id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                      <Heart className="w-4 h-4 fill-emerald-500/20" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{gw.itemTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Contributor: <strong>{gw.contributor?.name}</strong> → Recipient:{' '}
                        <strong>{gw.recipient?.name}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-emerald-700">
                      +{gw.goodwillCreditsAwarded} Goodwill Credits
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(gw.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Immutable log of all administrative interventions, credit adjustments, and suspensions.
          </div>
          <GlassCard className="p-0 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log._id} className="p-4 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Entity: <strong>{log.entity}</strong> (ID: {log.entityId})
                  </div>
                  <div className="text-slate-700 bg-slate-50 p-2 rounded-lg font-medium">
                    Reason: {log.reason}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Modal: Adjust Credits */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Credits for ${selectedUser?.name}`}
      >
        <form onSubmit={handleAdjustCredits} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <strong>Mandatory Audit Rule:</strong> Every credit adjustment is permanently logged in
            the audit trail with your admin ID, timestamp, and explanation.
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Credit Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('cash_credit')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  adjustType === 'cash_credit'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Cash Credits
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('goodwill_credit')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  adjustType === 'goodwill_credit'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                Goodwill Credits
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Adjustment Amount (+ to add, - to deduct)
            </label>
            <input
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Reason for Adjustment (Required)
            </label>
            <textarea
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Community contribution reward, mediation resolution..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              rows={3}
              required
            />
          </div>

          <Button type="submit" variant="primary" isLoading={isAdjusting} className="w-full">
            Confirm & Log Adjustment
          </Button>
        </form>
      </Modal>

      {/* Modal: Reject Withdrawal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Demo Withdrawal"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a reason for rejecting this demo withdrawal. The credits will be restored
            to the user's wallet.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Incomplete demo payout information..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            rows={3}
            required
          />
          <Button variant="danger" onClick={handleRejectWithdrawal} className="w-full">
            Reject & Refund Credits
          </Button>
        </div>
      </Modal>
    </div>
  );
};
