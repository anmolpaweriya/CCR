import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DemoPaymentModal } from '../components/payment/DemoPaymentModal';
import { DemoWithdrawalModal } from '../components/payment/DemoWithdrawalModal';
import {
  Coins,
  Heart,
  Plus,
  PackagePlus,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  HandHelping,
  Package,
  TrendingUp,
  Award,
} from 'lucide-react';
import { AssistanceRequest, Resource } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, wallet } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [goodwillOpps, setGoodwillOpps] = useState<any>({ assistance: [], resources: [] });
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [reqRes, resRes, gwRes] = await Promise.all([
          api.assistance.getAll({ status: 'OPEN' }),
          api.resources.getAll({ status: 'AVAILABLE' }),
          api.goodwill.getOpportunities(),
        ]);

        if (reqRes.success) setRequests(reqRes.requests || []);
        if (resRes.success) setResources(resRes.resources || []);
        if (gwRes.success) setGoodwillOpps(gwRes.opportunities || { assistance: [], resources: [] });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Greeting & Community Trust Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Neighbor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Active in {user?.locationZone || 'Greenwood District'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> {user?.reputationScore || 90}% Trust Rating
            </span>
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/assistance/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Ask for Help
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/resources/new')}
            leftIcon={<PackagePlus className="w-4 h-4 text-slate-500" />}
          >
            Share Resource
          </Button>
        </div>
      </div>

      {/* Two-Tier Credit Balance Display */}
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Cash Credits Card */}
        <GlassCard variant="cash" className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900/80 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-blue-600" />
                Cash Credits
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Withdrawable: {wallet?.withdrawableCashCredits ?? 0}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-blue-950 tracking-tight">
                {wallet?.cashCredits ?? 0}
              </span>
              <span className="text-xs font-semibold text-blue-700">Cash Credits</span>
            </div>

            <p className="text-xs text-blue-900/70 leading-relaxed">
              Monetary platform credits for standard assistance requests and physical tool rentals.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-200/60 flex items-center gap-2">
            <Button
              variant="cash"
              size="sm"
              onClick={() => setIsTopUpOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Top Up
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawOpen(true)}
              className="flex-1 text-blue-900 border-blue-200 hover:bg-white"
            >
              Withdraw
            </Button>
          </div>
        </GlassCard>

        {/* Goodwill Credits Card */}
        <GlassCard variant="goodwill" className="p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900/80 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-emerald-600 fill-emerald-500/20" />
                Goodwill Credits
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Community Only
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-emerald-950 tracking-tight">
                {wallet?.goodwillCredits ?? 0}
              </span>
              <span className="text-xs font-semibold text-emerald-700">Goodwill Credits</span>
            </div>

            <p className="text-xs text-emerald-900/70 leading-relaxed">
              Earned by helping neighbors for free. Automatically prioritized when you spend credits.
              Cannot be withdrawn.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-200/60 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">
              Total Earned: <strong>{wallet?.totalGoodwillEarned ?? 0} GW</strong>
            </span>
            <button
              onClick={() => navigate('/goodwill')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>Goodwill Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Goodwill Opportunities Spotlight */}
      {goodwillOpps.assistance.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                <Heart className="w-4 h-4 fill-white/20" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  💚 Active Goodwill Opportunities Nearby
                </h3>
                <p className="text-xs text-slate-500">
                  Help a neighbor without cash for free and receive Goodwill Credits.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/goodwill')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hidden sm:flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {goodwillOpps.assistance.slice(0, 2).map((opp: any) => (
              <div
                key={opp._id}
                onClick={() => navigate(`/assistance/${opp._id}`)}
                className="p-4 rounded-2xl bg-white/90 border border-emerald-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-1">{opp.title}</div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                    {opp.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span>{opp.approximateLocation}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="goodwill">+{opp.creditValue} Goodwill</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Nearby Assistance & Nearby Resources */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Nearby Assistance Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HandHelping className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">Requests Near You</h2>
            </div>
            <button
              onClick={() => navigate('/assistance')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 4).map((req) => (
              <GlassCard
                key={req._id}
                onClick={() => navigate(`/assistance/${req._id}`)}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                      {req.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{req.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {req.approximateLocation}
                      </span>
                    </div>
                  </div>
                  {req.requestType === 'GOODWILL' ? (
                    <Badge variant="goodwill">+{req.creditValue} Goodwill</Badge>
                  ) : (
                    <Badge variant="cash">{req.creditValue} Cash Credits</Badge>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {req.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.preferredDate} ({req.preferredTime})</span>
                  </span>
                  <Badge urgency={req.urgency} size="sm" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Nearby Physical Resources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">Resources Available to Borrow</h2>
            </div>
            <button
              onClick={() => navigate('/resources')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <span>Browse All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {resources.slice(0, 4).map((res) => (
              <GlassCard
                key={res._id}
                onClick={() => navigate(`/resources/${res._id}`)}
                className="p-4 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {res.images && res.images.length > 0 && (
                    <img
                      src={res.images[0]}
                      alt={res.name}
                      className="w-full h-28 object-cover rounded-xl mb-3 border border-slate-200/60"
                    />
                  )}
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {res.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant="cash" size="sm">
                    {res.creditPrice} Credits/day
                  </Badge>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Goodwill OK
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DemoPaymentModal isOpen={isTopUpOpen} onClose={() => setIsTopUpOpen(false)} />
      <DemoWithdrawalModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} />
    </div>
  );
};
