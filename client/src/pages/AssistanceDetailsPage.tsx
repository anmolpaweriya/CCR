import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { GoogleMapDisplay } from '../components/location/GoogleMapDisplay';
import { formatDisplayTime } from '../components/ui/TimeWindowPicker';
import {
  HandHelping,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  User,
  ArrowLeft,
  AlertTriangle,
  Play,
  Send,
  XCircle,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { AssistanceRequest } from '../types';

export const AssistanceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Offer form state
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerMessage, setOfferMessage] = useState('I would be glad to help with this request!');
  const [offerTime, setOfferTime] = useState('');

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.assistance.getById(id);
      if (res.success && res.request) {
        setRequest(res.request);

        // If requester and status is OPEN/VOLUNTEER_OFFERED, load AI matches
        const reqUserId = res.request.requester?._id || res.request.requester?.id;
        if (
          user &&
          reqUserId === user.id &&
          ['OPEN', 'VOLUNTEER_OFFERED', 'MATCHING'].includes(res.request.status)
        ) {
          try {
            const matchRes = await api.matching.getMatches(id);
            if (matchRes.success) {
              setMatches(matchRes.matches || []);
            }
          } catch (mErr) {
            console.error('Matching fetch non-critical error:', mErr);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load request:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user]);

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.submitOffer(id, {
        message: offerMessage,
        proposedTime: offerTime,
      });
      if (res.success) {
        showToast('Your offer has been submitted to the requester!', 'success');
        setShowOfferForm(false);
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit offer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawOffer = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.withdrawOffer(id);
      if (res.success) {
        showToast('Your offer has been withdrawn.', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to withdraw offer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId?: string, contributorId?: string) => {
    if (!id || !contributorId) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.acceptOffer(id, { offerId, contributorId });
      if (res.success) {
        showToast('Offer accepted! Contributor has been assigned.', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to accept offer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async (offerId?: string, contributorId?: string) => {
    if (!id || !contributorId) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.rejectOffer(id, { offerId, contributorId });
      if (res.success) {
        showToast('Offer declined.', 'info');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to decline offer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTask = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.startTask(id);
      if (res.success) {
        showToast('Task marked in progress! You may proceed with assistance.', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to start task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.completeTask(id, completionNotes);
      if (res.success) {
        showToast('Completion submitted! Requester notified for verification.', 'success');
        setShowCompletionModal(false);
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to complete task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.verify(id);
      if (res.success) {
        await refreshUser();
        showToast(res.message || 'Assistance verified! Credits settled.', 'success');
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.assistance.cancel(id, cancelReason);
      if (res.success) {
        await refreshUser();
        showToast(res.message || 'Request cancelled and credits refunded.', 'info');
        setShowCancelModal(false);
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!id || !disputeReason) {
      showToast('Please provide a reason for the dispute', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.assistance.dispute(id, { reason: disputeReason });
      if (res.success) {
        showToast('Dispute raised. Admin team has been notified.', 'info');
        setShowDisputeModal(false);
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to raise dispute', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading details...</div>;
  }

  if (!request) {
    return (
      <div className="p-12 text-center rounded-3xl glass-card">
        <h3 className="text-base font-bold text-slate-700">Request not found</h3>
        <Button variant="outline" size="sm" onClick={() => navigate('/assistance')} className="mt-4">
          Back to Assistance
        </Button>
      </div>
    );
  }

  const requesterId = request.requester?._id || request.requester?.id;
  const isRequester = user && requesterId === user.id;

  const contributorId = request.selectedContributor?._id || request.selectedContributor?.id;
  const isSelectedContributor = user && contributorId === user.id;

  const myOffer =
    user && request.offers
      ? request.offers.find((o: any) => {
          const vId = o.volunteer?._id || o.volunteer?.id || o.volunteer;
          return vId === user.id;
        })
      : null;

  const formattedTimeWindow = request.preferredTimeWindow?.startTime
    ? `${formatDisplayTime(request.preferredTimeWindow.startTime)} – ${formatDisplayTime(request.preferredTimeWindow.endTime)}`
    : request.preferredTime || 'Flexible';

  const coordinates = request.location?.coordinates ||
    ((request as any).locationCoordinates ? [(request as any).locationCoordinates.lng, (request as any).locationCoordinates.lat] : undefined);

  // Exact location revealed only if requester OR accepted contributor and request is accepted
  const canSeeExactLocation =
    isRequester ||
    (isSelectedContributor &&
      ['ACCEPTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'VERIFICATION_PENDING', 'COMPLETED', 'VERIFIED', 'SETTLED'].includes(
        request.status
      ));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/assistance')}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Assistance</span>
      </button>

      {/* Main Request Header */}
      <GlassCard className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge status={request.status} />
              <Badge urgency={request.urgency} />
              <span className="text-xs font-semibold text-slate-500">{request.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {request.title}
            </h1>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            {request.requestType === 'GOODWILL' ? (
              <div>
                <Badge variant="goodwill" size="lg">
                  +{request.creditValue} Goodwill Credits
                </Badge>
                <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
                  💚 Free community goodwill contribution
                </div>
              </div>
            ) : (
              <div>
                <Badge variant="cash" size="lg">
                  {request.creditValue} Cash Credits
                </Badge>
                <div className="text-[11px] text-slate-500 mt-1">
                  Escrowed until verified completion
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Date</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {request.preferredDate}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Time Window</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {formattedTimeWindow}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Duration</span>
            <span className="font-semibold text-slate-800">
              ~{request.estimatedDuration} mins
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Area / Proximity</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">
                {request.location?.locality || request.approximateLocation || 'Neighborhood'}
              </span>
            </span>
          </div>
        </div>

        {/* Google Map Section */}
        {coordinates && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {canSeeExactLocation ? 'Task Location (Exact Details)' : 'Approximate Vicinity'}
            </h3>
            <GoogleMapDisplay
              coordinates={coordinates}
              address={canSeeExactLocation ? request.location?.address : request.location?.locality}
              isApproximate={!canSeeExactLocation}
              title={request.title}
              height="h-56"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {request.description}
          </p>
        </div>

        {/* Skills */}
        {request.requiredSkills && request.requiredSkills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Required Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {request.requiredSkills.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requester Profile */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
              {request.requester?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{request.requester?.name}</div>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span>{request.requester?.locationZone || 'CCR Community'}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">
                  {request.requester?.reputationScore || 90}% Trust Rating
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Volunteer Offer Button for Helpers */}
            {!isRequester && ['OPEN', 'VOLUNTEER_OFFERED'].includes(request.status) && (
              <>
                {myOffer ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      ✓ Offer Submitted ({myOffer.status})
                    </span>
                    {myOffer.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleWithdrawOffer}
                        isLoading={actionLoading}
                      >
                        Withdraw Offer
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    variant={request.requestType === 'GOODWILL' ? 'goodwill' : 'primary'}
                    onClick={() => setShowOfferForm(true)}
                    isLoading={actionLoading}
                    leftIcon={<HandHelping className="w-4 h-4" />}
                  >
                    Volunteer to Help
                  </Button>
                )}
              </>
            )}

            {/* Contributor: Start Task */}
            {isSelectedContributor && request.status === 'ACCEPTED' && (
              <Button
                variant="primary"
                onClick={handleStartTask}
                isLoading={actionLoading}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Start Task Now
              </Button>
            )}

            {/* Contributor: Mark Completed */}
            {isSelectedContributor && ['ACCEPTED', 'IN_PROGRESS'].includes(request.status) && (
              <Button
                variant="goodwill"
                onClick={() => setShowCompletionModal(true)}
                isLoading={actionLoading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Submit Completion
              </Button>
            )}

            {/* Requester: Verify Completion */}
            {isRequester && ['COMPLETION_PENDING', 'VERIFICATION_PENDING', 'COMPLETED'].includes(request.status) && (
              <Button
                variant="goodwill"
                onClick={handleVerify}
                isLoading={actionLoading}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Verify Completion & Release Credits
              </Button>
            )}

            {/* Requester / Contributor: Dispute */}
            {(isRequester || isSelectedContributor) &&
              ['ACCEPTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'VERIFICATION_PENDING'].includes(request.status) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisputeModal(true)}
                  leftIcon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                >
                  Raise Dispute
                </Button>
              )}

            {/* Requester: Cancel */}
            {isRequester && ['OPEN', 'VOLUNTEER_OFFERED', 'ACCEPTED'].includes(request.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                leftIcon={<XCircle className="w-4 h-4 text-rose-500" />}
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Volunteer Offer Form Modal / Inline Box */}
      {showOfferForm && (
        <GlassCard className="p-6 border-2 border-emerald-500/40 animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              Submit Volunteer Offer
            </h3>
            <button
              onClick={() => setShowOfferForm(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmitOffer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Message to Requester
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={3}
                placeholder="Explain how you can help, any relevant tools you bring..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Time / Availability (Optional)
              </label>
              <input
                type="text"
                value={offerTime}
                onChange={(e) => setOfferTime(e.target.value)}
                placeholder="e.g. Can be there at 10:00 AM sharp"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowOfferForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
                Confirm Offer
              </Button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <GlassCard className="p-6 border-2 border-emerald-500/40">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Submit Task Completion
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Provide any final notes for the requester. Once submitted, the requester will verify and
            your credits will be settled.
          </p>
          <textarea
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={3}
            placeholder="e.g. Assembled wardrobe and leveled legs. Left spare bolts on the counter."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCompletionModal(false)}>
              Cancel
            </Button>
            <Button variant="goodwill" size="sm" onClick={handleCompleteTask} isLoading={actionLoading}>
              Confirm Completion
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <GlassCard className="p-6 border-2 border-rose-500/40">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-600" />
            Cancel Assistance Request
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Are you sure you want to cancel this request? Any reserved credits will be immediately
            refunded to your wallet.
          </p>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Optional reason for cancellation..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCancelModal(false)}>
              Keep Request
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancelRequest} isLoading={actionLoading}>
              Confirm Cancellation
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <GlassCard className="p-6 border-2 border-amber-500/40">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Raise a Dispute
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            If an issue arose during this assistance that cannot be resolved mutually, submit details
            for administrative mediation.
          </p>
          <textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            rows={3}
            placeholder="Describe what occurred..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDisputeModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleDispute} isLoading={actionLoading}>
              Submit Dispute
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Selected Contributor card (if assigned) */}
      {request.selectedContributor && (
        <GlassCard className="p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Assigned Community Helper
            </h3>
            <Badge status={request.status} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                {request.selectedContributor.name?.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {request.selectedContributor.name}
                </div>
                <div className="text-xs text-slate-500">
                  {request.selectedContributor.locationZone} •{' '}
                  {request.selectedContributor.reputationScore}% Trust Rating
                </div>
              </div>
            </div>
            {request.completionNotes && (
              <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-w-xs text-slate-600">
                <strong>Completion note:</strong> {request.completionNotes}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Volunteer Offers Received (Visible to Requester) */}
      {isRequester && request.offers && request.offers.length > 0 && ['OPEN', 'VOLUNTEER_OFFERED'].includes(request.status) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HandHelping className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Volunteer Offers Received ({request.offers.length})
              </h2>
            </div>
            <span className="text-xs text-slate-500">Select your preferred volunteer</span>
          </div>

          <div className="space-y-3">
            {request.offers.map((offer: any) => {
              const vol = offer.volunteer;
              const volId = vol?._id || vol?.id || vol;
              const isPending = offer.status === 'PENDING';

              return (
                <GlassCard key={offer._id || volId} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {vol?.name?.charAt(0) || 'V'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{vol?.name || 'Community Member'}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                            {vol?.reputationScore || 90}% Trust
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 italic">
                          "{offer.message || 'Ready to assist with this task.'}"
                        </p>
                        {offer.proposedTime && (
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Proposed availability: {offer.proposedTime}
                          </div>
                        )}
                      </div>
                    </div>

                    {isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectOffer(offer._id, volId)}
                          isLoading={actionLoading}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptOffer(offer._id, volId)}
                          isLoading={actionLoading}
                        >
                          Accept Offer
                        </Button>
                      </div>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Ranked Candidate Contributors (Visible to Requester when OPEN) */}
      {isRequester && ['OPEN', 'VOLUNTEER_OFFERED', 'MATCHING'].includes(request.status) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">
                AI Ranked Contributor Recommendations
              </h2>
            </div>
            <span className="text-xs text-slate-500">Based on skills, proximity & availability</span>
          </div>

          {matches.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-card text-xs text-slate-500">
              Searching for optimal community matches based on skills and location proximity...
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <GlassCard key={match.user._id} className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {match.user.name?.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{match.user.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            {match.matchScore}% Match
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5">
                          {match.user.locationZone} • {match.user.reputationScore}% Trust Rating •{' '}
                          {match.user.completedContributions} verified contributions
                        </div>

                        {/* Explainable Reasons */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {match.reasons.map((r: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                            >
                              • {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptOffer(undefined, match.user._id)}
                        isLoading={actionLoading}
                      >
                        Select Contributor
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
