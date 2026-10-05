import React, { useState } from 'react';
import { Sparkles, ChevronDown, Info } from 'lucide-react';

interface AIExplainerProps {
  title?: string;
  recommendedCredits?: number;
  matchScore?: number;
  reasons: string[];
  type?: 'valuation' | 'matching';
}

export const AIExplainerBadge: React.FC<AIExplainerProps> = ({
  title,
  recommendedCredits,
  matchScore,
  reasons,
  type = 'valuation',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-indigo-50/70 border border-indigo-200/80 p-3.5 backdrop-blur-xs transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-100 text-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-900">
              {title || (type === 'valuation' ? 'AI Recommended Value' : 'AI Match Quality')}
            </div>
            <div className="text-xs text-indigo-700 font-medium">
              {type === 'valuation' && recommendedCredits !== undefined && (
                <span>{recommendedCredits} Credits recommended</span>
              )}
              {type === 'matching' && matchScore !== undefined && (
                <span>{matchScore}% Compatibility Score</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-800">
          <span>Why?</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-indigo-200/60 animate-in fade-in duration-150">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900/70 mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Decision Factors:
          </div>
          <ul className="space-y-1.5">
            {reasons.map((reason, index) => (
              <li key={index} className="text-xs text-indigo-950 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
