import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AIExplainerBadge } from '../components/ai/AIExplainerBadge';
import {
  HandHelping,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Coins,
  CheckCircle2,
} from 'lucide-react';

export const CreateAssistancePage: React.FC = () => {
  const { user, wallet, refreshUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Home Improvement');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [preferredTime, setPreferredTime] = useState('Afternoon');
  const [approximateLocation, setApproximateLocation] = useState(
    user?.locationZone || 'Greenwood District'
  );
  const [requestType, setRequestType] = useState<'STANDARD' | 'GOODWILL'>('STANDARD');
  const [creditValue, setCreditValue] = useState<number>(10);
  const [aiValuation, setAiValuation] = useState<{
    recommendedCredits: number;
    minAllowedCredits: number;
    maxAllowedCredits: number;
    reasons: string[];
  } | null>(null);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch AI Valuation when entering step 5
  const fetchValuation = async () => {
    setIsEvaluating(true);
    try {
      const skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.valuation.evaluateAssistance({
        category,
        estimatedDuration,
        urgency,
        requiredSkills: skillsArray,
      });

      if (res.success && res.valuation) {
        setAiValuation(res.valuation);
        setCreditValue(res.valuation.recommendedCredits);
      }
    } catch (error) {
      console.error('Failed to get valuation:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = async () => {
    if (step === 1 && !title) {
      showToast('Please enter a title for your request.', 'error');
      return;
    }
    if (step === 2 && !description) {
      showToast('Please provide some details for your request.', 'error');
      return;
    }
    if (step === 4) {
      await fetchValuation();
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.assistance.create({
        title,
        description,
        category,
        requiredSkills: skillsArray,
        estimatedDuration,
        urgency,
        preferredDate,
        preferredTime,
        approximateLocation,
        creditValue,
        requestType,
      });

      if (res.success) {
        await refreshUser();
        showToast(res.message, 'success');
        navigate(`/assistance/${res.request._id}`);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to create request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Home Improvement',
    'Moving & Lifting',
    'Tech & Digital',
    'Errands & Delivery',
    'Gardening & Outdoor',
    'Tutoring & Skills',
    'Pet Care',
    'Other',
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HandHelping className="w-7 h-7 text-emerald-600" />
          Ask for Community Help
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Follow the 6 simple steps to post your request with AI-assisted credit valuation.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s
                  ? 'bg-slate-900 text-white ring-4 ring-slate-200'
                  : step > s
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            {s < 6 && (
              <div
                className={`h-0.5 w-6 sm:w-10 rounded-full transition-all ${
                  step > s ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <GlassCard className="p-6 sm:p-8">
        {/* Step 1: What do you need? */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Step 1 of 6
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">What do you need help with?</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Request Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Help Assemble IKEA Pax Wardrobe"
                className="w-full px-4 py-3 rounded-xl glass-input text-base text-slate-900 font-medium"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-xl text-xs font-semibold text-left border transition-all ${
                      category === cat
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Step 2 of 6
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Provide Task Details</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Description & Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what needs to be done, what tools you already have, and what the helper should bring..."
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-900 leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Required Skills (Comma-separated)
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. Carpentry, Heavy Lifting, Furniture Assembly"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Estimated Duration (Minutes)
              </label>
              <div className="flex items-center gap-3">
                {[30, 60, 90, 120, 180].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setEstimatedDuration(mins)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      estimatedDuration === mins
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: When? */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Step 3 of 6
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">When is this needed?</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Preferred Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Preferred Time Window
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    placeholder="e.g. Saturday Morning, 5:00 PM"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((urg) => (
                  <button
                    type="button"
                    key={urg}
                    onClick={() => setUrgency(urg)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      urgency === urg
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {urg}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Where? */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Step 4 of 6
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Approximate Location</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Locality / Zone (Approximate)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={approximateLocation}
                  onChange={(e) => setApproximateLocation(e.target.value)}
                  placeholder="e.g. Greenwood District (approx. 0.8 km)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-slate-900"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                🔒 <strong>Privacy Guarantee:</strong> CCR never discloses your exact residential
                address publicly. Contributor candidates only see your neighborhood zone and
                approximate distance.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Suggested Contribution Value (AI Valuation) */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Step 5 of 6
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Suggested Contribution Value
              </h2>
            </div>

            {/* AI Explainer */}
            {aiValuation && (
              <AIExplainerBadge
                title="CCR Intelligent Valuation Engine"
                recommendedCredits={aiValuation.recommendedCredits}
                reasons={aiValuation.reasons}
                type="valuation"
              />
            )}

            {/* Request Type Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Request Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestType('STANDARD')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    requestType === 'STANDARD'
                      ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Coins className="w-5 h-5 text-blue-600 mb-1" />
                  <div className="text-sm font-bold text-slate-900">Standard Request</div>
                  <div className="text-[11px] text-slate-500">
                    Paid via your available Goodwill Credits first, then Cash Credits.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType('GOODWILL')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    requestType === 'GOODWILL'
                      ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="w-5 h-5 text-emerald-600 mb-1" />
                  <div className="text-sm font-bold text-slate-900">Request as Goodwill</div>
                  <div className="text-[11px] text-slate-500">
                    Free for you. Contributor earns Goodwill Credits upon verification!
                  </div>
                </button>
              </div>
            </div>

            {requestType === 'STANDARD' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Assigned Credit Value: {creditValue} Credits
                </label>
                <input
                  type="range"
                  min={aiValuation?.minAllowedCredits || 3}
                  max={aiValuation?.maxAllowedCredits || 30}
                  value={creditValue}
                  onChange={(e) => setCreditValue(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Min: {aiValuation?.minAllowedCredits || 3} Credits</span>
                  <span className="font-bold text-emerald-700">Selected: {creditValue} Credits</span>
                  <span>Max: {aiValuation?.maxAllowedCredits || 30} Credits</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Step 6 of 6
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Review and Publish</h2>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Title:</span>
                <span className="font-bold text-slate-900">{title}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{category}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">When:</span>
                <span className="font-semibold text-slate-800">
                  {preferredDate} ({preferredTime})
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500">Approximate Area:</span>
                <span className="font-semibold text-slate-800">{approximateLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valuation:</span>
                <span className="font-bold text-emerald-700">
                  {requestType === 'GOODWILL'
                    ? `Goodwill (0 cost, +${creditValue} GW to helper)`
                    : `${creditValue} Credits (Goodwill used first)`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upon publishing, CCR's AI Matching engine will notify nearby neighbors possessing the
              required skills.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="goodwill"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Publish Request
            </Button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
