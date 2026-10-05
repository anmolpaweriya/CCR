import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Coins,
  Sparkles,
  ShieldCheck,
  Users,
  Package,
  HandHelping,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 text-center max-w-4xl mx-auto px-4">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-top-3 duration-500">
          <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500/20" />
          <span>Hyperlocal Mutual Assistance & Resource Sharing</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.1] mb-6">
          Connect with people.{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
            Contribute what you can.
          </span>{' '}
          Receive what you need.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          CCR transforms your time, skills, and idle household tools into verifiable community
          value through a balanced two-tier credit economy.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/register')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto shadow-md"
          >
            Get Started
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/explore')}
            className="w-full sm:w-auto"
          >
            Explore CCR
          </Button>
        </div>

        {/* Community Philosophy banner */}
        <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto text-left">
          <div className="p-4 rounded-2xl glass-card text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              1. Connect
            </div>
            <div className="text-xs text-slate-600">Find nearby neighbors and available tools</div>
          </div>
          <div className="p-4 rounded-2xl glass-card text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              2. Contribute
            </div>
            <div className="text-xs text-slate-600">Provide hands-on help or lend equipment</div>
          </div>
          <div className="p-4 rounded-2xl glass-card text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              3. Receive
            </div>
            <div className="text-xs text-slate-600">Use earned credits whenever you need support</div>
          </div>
        </div>
      </section>

      {/* Feature 1: The Two-Tier Credit System */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            A Dual Economy Designed for Community Trust
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            CCR never conflates monetary credits with community goodwill. We maintain two distinct
            balances with clear spending and earning rules.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Cash Credits Card */}
          <GlassCard variant="cash" className="p-8 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-600/30">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Cash Credits</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Monetary-value credits for standard assistance and tool rentals. Users can top up via
              simulated payments, earn credits by providing paid support, and withdraw eligible
              balances.
            </p>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Top up anytime using the Demo Payment gateway</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Earned Cash Credits are eligible for demo withdrawal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Full immutable transaction ledger record for every transfer</span>
              </li>
            </ul>
          </GlassCard>

          {/* Goodwill Credits Card */}
          <GlassCard variant="goodwill" className="p-8 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-600/30">
              <Heart className="w-6 h-6 fill-white/20" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Goodwill Credits</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Special, non-withdrawable community credits awarded when you provide assistance or lend
              tools for free. They empower neighbors without immediate funds to participate with
              dignity.
            </p>
            <ul className="space-y-3 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Awarded upon mutual verification of goodwill acts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Spent first by default when requesting future assistance</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Strictly non-withdrawable and cannot be converted into cash</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </section>

      {/* Feature 2: Core Platform Capabilities */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Engineered for Real-World Local Collaboration
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Everything you need to exchange assistance and physical resources safely.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
              <HandHelping className="w-5 h-5 text-emerald-400" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Hyperlocal Assistance</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Post requests for furniture assembly, gardening, tech support, or moving. Track
              progress through clear lifecycle states from matching to verified completion.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Physical Resource Sharing</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Lend drills, ladders, cameras, bicycles, and camping gear. Borrow items for cash or
              request as goodwill without purchasing expensive equipment you only use once.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">AI-Powered Matching</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Multi-factor algorithm ranking candidates based on proximity, capability, availability,
              and reliability, with transparent human-readable explanations.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Intelligent Valuation</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Deterministic valuation engine evaluating task complexity, duration, urgency, and local
              demand to suggest fair credit compensations.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Mutual Verification & Privacy</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Credits are held in escrow until completion or return is verified. Exact addresses are
              never publicly exposed, using approximate locality zones instead.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg mb-2">Reputation & Trust</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Earn community badges such as Reliable Contributor, Resource Sharer, and Goodwill
              Contributor through verified local participation.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to participate in your local community?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Create an account in seconds. New accounts receive 50 Cash Credits and 20 Goodwill Credits
            to immediately begin requesting and sharing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="goodwill"
              size="lg"
              onClick={() => navigate('/register')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Join CCR Community
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="text-white border-slate-700 hover:bg-slate-800"
            >
              Sign In with Demo Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
