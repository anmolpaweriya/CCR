import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatDisplayTime } from '../components/ui/TimeWindowPicker';
import {
  Activity,
  HandHelping,
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Coins,
  Heart,
  Calendar,
  AlertTriangle,
  XCircle,
  Send,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AssistanceRequest, Resource } from '../types';

export const MyActivitiesPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'CONTRIBUTIONS' | 'BORROWING' | 'LISTINGS'>('REQUESTS');
  const [myRequests, setMyRequests] = useState<AssistanceRequest[]>([]);
  const [myContributions, setMyContributions] = useState<any[]>([]);
  const [myResources, setMyResources] = useState<Resource[]>([]);
  const [borrowRequests, setBorrowRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dispute modal state
  const [disputeModalData, setDisputeModalData] = useState<{ type: 'assistance' | 'resource'; id: string } | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const loadActivities = async () => {
    try {
      setLoading(true);
      const [astRes, resListingsRes, resReqsRes] = await Promise.all([
        api.assistance.getAll(),
        api.resources.getMyListings().catch(() => ({ success: false, resources: [] })),
        api.resources.getMyRequests().catch(() => ({ success: false, requests: [] })),
      ]);

      if (astRes.success && user) {
        // Filter requests created by current user
        const mine = astRes.requests.filter(
          (r: any) => r.requester?._id === user.id || r.requester?.id === user.id
        );
        setMyRequests(mine);

        // Filter contributions where user is selected contributor or applied/offered
        const helping = astRes.requests.filter(
          (r: any) =>
            r.selectedContributor?._id === user.id ||
            r.selectedContributor?.id === user.id ||
            (r.offers && r.offers.some((o: any) => {
              const vId = o.volunteer?._id || o.volunteer?.id || o.volunteer;
              return vId === user.id;
            })) ||
            (r.appliedContributors &&
              r.appliedContributors.some((u: any) => u._id === user.id || u.id === user.id))
        );
        setMyContributions(helping);
      }

      if (resListingsRes.success) {
        setMyResources(resListingsRes.resources || []);
      }

      if (resReqsRes.success) {
        setBorrowRequests(resReqsRes.requests || []);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [user]);

  // Assistance Verification
  const handleVerifyAssistance = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await api.assistance.verify(id);
      if (res.success) {
        await refreshUser();
        showToast(res.message, 'success');
        await loadActivities();
      }
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Resource Owner Decisions: Accept or Decline
  const handleResourceDecision = async (requestId: string, decision: 'ACCEPT' | 'DECLINE') => {
    setActionLoading(true);
    try {
      const res = await api.resources.handleDecision(requestId, decision);
      if (res.success) {
        showToast(res.message, 'success');
        await loadActivities();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to handle resource decision', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Resource Status Update: Handover (Owner) or Initiate Return (Borrower)
  const handleUpdateResourceStatus = async (requestId: string, status: string) => {
    setActionLoading(true);
    try {
      const res = await api.resources.updateStatus(requestId, status);
      if (res.success) {
        showToast(res.message, 'success');
        await loadActivities();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update resource status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Resource Return Verification (Owner)
  const handleVerifyReturn = async (requestId: string) => {
    setActionLoading(true);
    try {
      const res = await api.resources.verifyReturn(requestId);
      if (res.success) {
        await refreshUser();
        showToast(res.message || 'Resource return verified! Credits released.', 'success');
        await loadActivities();
      }
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Resource Request (Borrower)
  const handleCancelResourceRequest = async (requestId: string) => {
    setActionLoading(true);
    try {
      const res = await api.resources.cancelRequest(requestId);
      if (res.success) {
        await refreshUser();
        showToast(res.message, 'info');
        await loadActivities();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Dispute Submit
  const handleSubmitDispute = async () => {
    if (!disputeModalData || !disputeReason) {
      showToast('Please provide a reason for the dispute', 'error');
      return;
    }
    setActionLoading(true);
    try {
      if (disputeModalData.type === 'resource') {
        const res = await api.resources.dispute(disputeModalData.id, { reason: disputeReason });
        showToast(res.message, 'info');
      } else {
        const res = await api.assistance.dispute(disputeModalData.id, { reason: disputeReason });
        showToast(res.message, 'info');
      }
      setDisputeModalData(null);
      setDisputeReason('');
      await loadActivities();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit dispute', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const incomingResourceRequests = borrowRequests.filter(
    (b) => b.owner?._id === user?.id || b.owner?.id === user?.id
  );
  const outgoingResourceRequests = borrowRequests.filter(
    (b) => b.borrower?._id === user?.id || b.borrower?.id === user?.id
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="w-7 h-7 text-emerald-600" />
          My Activities & Verifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your posted requests, active contributions, tool loans, and pending verifications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'REQUESTS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Assistance Requests ({myRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('CONTRIBUTIONS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CONTRIBUTIONS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Volunteering ({myContributions.length})
        </button>

        <button
          onClick={() => setActiveTab('BORROWING')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'BORROWING'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tool Loans & Borrowing ({borrowRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('LISTINGS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LISTINGS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Shared Resources ({myResources.length})
        </button>
      </div>

      {/* Dispute Modal */}
      {disputeModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Raise Dispute
            </h3>
            <p className="text-xs text-slate-500">
              Provide details regarding the issue (e.g. unreturned resource, task incomplete, damage). An administrator will review and mediate.
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={3}
              placeholder="State the reason for dispute..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDisputeModalData(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleSubmitDispute} isLoading={actionLoading}>
                Submit Dispute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your activities...</div>
      ) : activeTab === 'REQUESTS' ? (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-card text-xs text-slate-400">
              You haven't created any assistance requests yet.
            </div>
          ) : (
            myRequests.map((req) => {
              const timeDisplay = req.preferredTimeWindow?.startTime
                ? `${formatDisplayTime(req.preferredTimeWindow.startTime)} - ${formatDisplayTime(req.preferredTimeWindow.endTime)}`
                : req.preferredTime;

              return (
                <GlassCard key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge status={req.status} size="sm" />
                      <span className="text-xs text-slate-400">{req.category}</span>
                      {req.offers && req.offers.length > 0 && ['OPEN', 'VOLUNTEER_OFFERED'].includes(req.status) && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {req.offers.length} offer{req.offers.length > 1 ? 's' : ''} received
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                      <span>{req.preferredDate} ({timeDisplay})</span>
                      <span>•</span>
                      <span>
                        {req.requestType === 'GOODWILL'
                          ? 'Goodwill (0 cost)'
                          : `${req.creditValue} Cash Credits`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {['VERIFICATION_PENDING', 'COMPLETION_PENDING', 'COMPLETED'].includes(req.status) && (
                      <Button
                        variant="goodwill"
                        size="sm"
                        onClick={() => handleVerifyAssistance(req._id)}
                        isLoading={actionLoading}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Verify & Release Credits
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/assistance/${req._id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      ) : activeTab === 'CONTRIBUTIONS' ? (
        <div className="space-y-3">
          {myContributions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-card text-xs text-slate-400">
              You haven't volunteered for any requests yet. Check the Explore or Goodwill tab!
            </div>
          ) : (
            myContributions.map((req) => (
              <GlassCard key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge status={req.status} size="sm" />
                    <span className="text-xs text-slate-400">Requester: {req.requester?.name}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{req.title}</h3>
                  <div className="text-xs text-slate-500 mt-1">
                    Reward:{' '}
                    <strong>
                      {req.creditValue} {req.requestType === 'GOODWILL' ? 'Goodwill' : 'Cash'} Credits
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/assistance/${req._id}`)}
                  >
                    Open Task
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      ) : activeTab === 'BORROWING' ? (
        <div className="space-y-6">
          {/* Incoming Lending Requests (People asking to borrow my tools) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Incoming Requests on My Tools ({incomingResourceRequests.length})
            </h3>
            {incomingResourceRequests.length === 0 ? (
              <div className="p-6 text-center rounded-2xl glass-card text-xs text-slate-400">
                No incoming loan requests at the moment.
              </div>
            ) : (
              incomingResourceRequests.map((booking) => (
                <GlassCard key={booking._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge status={booking.status} size="sm" />
                      <span className="text-xs font-semibold text-slate-600">
                        Borrower: {booking.borrower?.name}
                      </span>
                      {booking.isGoodwill && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          💚 Goodwill Loan
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{booking.resource?.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Period: {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'Flexible'} –{' '}
                      {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : `${booking.days} days`} (
                      {booking.days} days) • {booking.totalPrice} Credits
                    </p>
                    {booking.message && (
                      <p className="text-xs text-slate-600 mt-1 italic">"{booking.message}"</p>
                    )}
                  </div>

                  {/* Actions for Resource Owner */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {booking.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResourceDecision(booking._id, 'DECLINE')}
                          isLoading={actionLoading}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleResourceDecision(booking._id, 'ACCEPT')}
                          isLoading={actionLoading}
                        >
                          Approve Request
                        </Button>
                      </>
                    )}

                    {booking.status === 'ACCEPTED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateResourceStatus(booking._id, 'BORROWED')}
                        isLoading={actionLoading}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Confirm Handover to Borrower
                      </Button>
                    )}

                    {booking.status === 'RETURN_PENDING' && (
                      <Button
                        variant="goodwill"
                        size="sm"
                        onClick={() => handleVerifyReturn(booking._id)}
                        isLoading={actionLoading}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Verify Return & Release Credits
                      </Button>
                    )}

                    {['ACCEPTED', 'BORROWED', 'RETURN_PENDING'].includes(booking.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDisputeModalData({ type: 'resource', id: booking._id })}
                        leftIcon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                      >
                        Dispute
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ))
            )}
          </div>

          {/* Outgoing Requests (Tools I have borrowed from neighbors) */}
          <div className="space-y-3 pt-4 border-t border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              My Borrowed Tools & Requests ({outgoingResourceRequests.length})
            </h3>
            {outgoingResourceRequests.length === 0 ? (
              <div className="p-6 text-center rounded-2xl glass-card text-xs text-slate-400">
                You haven't requested to borrow any tools yet.
              </div>
            ) : (
              outgoingResourceRequests.map((booking) => (
                <GlassCard key={booking._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge status={booking.status} size="sm" />
                      <span className="text-xs text-slate-500">
                        Owner: {booking.owner?.name} ({booking.resource?.locationZone})
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{booking.resource?.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Period: {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'Flexible'} –{' '}
                      {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : `${booking.days} days`} •{' '}
                      {booking.isGoodwill ? 'Free Goodwill' : `${booking.totalPrice} Credits`}
                    </p>
                  </div>

                  {/* Actions for Borrower */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {booking.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelResourceRequest(booking._id)}
                        isLoading={actionLoading}
                        leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
                      >
                        Cancel Booking
                      </Button>
                    )}

                    {['ACCEPTED', 'BORROWED'].includes(booking.status) && (
                      <Button
                        variant="goodwill"
                        size="sm"
                        onClick={() => handleUpdateResourceStatus(booking._id, 'RETURN_PENDING')}
                        isLoading={actionLoading}
                        leftIcon={<RotateCcw className="w-4 h-4" />}
                      >
                        Initiate Return
                      </Button>
                    )}

                    {['ACCEPTED', 'BORROWED', 'RETURN_PENDING'].includes(booking.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDisputeModalData({ type: 'resource', id: booking._id })}
                        leftIcon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                      >
                        Dispute
                      </Button>
                    )}
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {myResources.length === 0 ? (
            <div className="sm:col-span-2 p-12 text-center rounded-3xl glass-card text-xs text-slate-400">
              You haven't shared any physical resources yet.
            </div>
          ) : (
            myResources.map((res) => (
              <GlassCard key={res._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge status={res.status} size="sm" />
                    <span className="text-xs font-bold text-blue-700">
                      {res.creditPrice} Credits/day
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{res.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400">{res.availability}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/resources/${res._id}`)}
                  >
                    Manage Item
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
};
