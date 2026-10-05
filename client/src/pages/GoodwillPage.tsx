import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Heart,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Lock,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const GoodwillPage: React.FC = () => {
  const { user, wallet } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<{ assistance: any[]; resources: any[] }>({
    assistance: [],
    resources: [],
  });
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'OPPORTUNITIES' | 'HISTORY'>('OPPORTUNITIES');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGoodwill = async () => {
      try {
        setLoading(true);
        const [oppRes, histRes] = await Promise.all([
          api.goodwill.getOpportunities(),
          api.goodwill.getMyHistory(),
        ]);

        if (oppRes.success) setOpportunities(oppRes.opportunities || { assistance: [], resources: [] });
        if (histRes.success) setHistory(histRes.transactions || []);
      } catch (error) {
        console.error('Failed to load goodwill:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGoodwill();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-800 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/30" />
            <span>The Heart of CCR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Goodwill Community Network
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-6">
            Goodwill Credits recognize and reward voluntary assistance. When you help a neighbor for
            free or lend a tool to someone without funds, you receive Goodwill Credits that can be
            redeemed for future help when you need it.
          </p>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-400/20">
              <span className="text-xs text-emerald-300 block">Your Goodwill Balance</span>
              <span className="text-2xl font-bold text-white">
                {wallet?.goodwillCredits ?? 0} GW
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-400/20">
              <span className="text-xs text-emerald-300 block">Total Goodwill Earned</span>
              <span className="text-2xl font-bold text-white">
                {wallet?.totalGoodwillEarned ?? 0} GW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('OPPORTUNITIES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OPPORTUNITIES'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Goodwill Opportunities ({opportunities.assistance.length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          My Goodwill History ({history.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'OPPORTUNITIES' ? (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            These requests are seeking free community goodwill assistance. Volunteer to help and earn
            non-withdrawable Goodwill Credits upon completion.
          </div>

          {opportunities.assistance.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-card text-xs text-slate-500">
              No active goodwill requests at this moment. Check back soon!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {opportunities.assistance.map((opp) => (
                <GlassCard
                  key={opp._id}
                  onClick={() => navigate(`/assistance/${opp._id}`)}
                  className="p-5 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        Goodwill Opportunity
                      </span>
                      <Badge variant="goodwill">+{opp.creditValue} Goodwill</Badge>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1.5 hover:text-emerald-600 transition-colors">
                      {opp.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                      {opp.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{opp.approximateLocation}</span>
                    </span>
                    <Button variant="goodwill" size="sm">
                      Help Neighbor
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <GlassCard className="p-0 overflow-hidden">
            {history.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Your goodwill journey starts here. Volunteer for an assistance request or accept a
                goodwill tool loan to earn your first Goodwill Credits!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((tx) => (
                  <div
                    key={tx._id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                        <Heart className="w-4 h-4 fill-emerald-500/20" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{tx.itemTitle}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Recipient: {tx.recipient?.name || 'Neighbor'} • Verified on{' '}
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-extrabold text-emerald-700">
                        +{tx.goodwillCreditsAwarded} Goodwill Credits
                      </div>
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};
