import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Heart, Check, X as XIcon, Sparkles } from 'lucide-react';

interface GoodwillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  itemName: string;
  credits: number;
  requesterName?: string;
  isLoading?: boolean;
}

export const GoodwillModal: React.FC<GoodwillModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  itemName,
  credits,
  requesterName = 'A neighbor nearby',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center py-2">
        {/* Glowing Goodwill Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10 mb-4 animate-bounce duration-1000">
          <Heart className="w-8 h-8 fill-emerald-500/20" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          💚 Goodwill Opportunity
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-5">
          <span className="font-semibold text-slate-800">{requesterName}</span> would benefit
          from using your <span className="font-semibold text-slate-800">{itemName}</span> but
          cannot currently pay the {credits}-credit cost.
        </p>

        {/* Credit Reward Box */}
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 mb-5 text-left">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-emerald-200/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Community Reward
            </span>
            <span className="text-lg font-extrabold text-emerald-700">
              +{credits} Goodwill Credits
            </span>
          </div>

          <div className="space-y-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
              <span>Can be used anywhere on the CCR platform</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
              <span>Prioritized automatically when requesting future help</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <XIcon className="w-3.5 h-3.5 text-rose-500 shrink-0 stroke-[2.5]" />
              <span>Non-withdrawable (cannot be converted into cash)</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-6 italic">
          "Contribute what you can. Receive what you need."
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Not Now
          </Button>
          <Button
            variant="goodwill"
            onClick={onAccept}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
            className="flex-1"
          >
            Help for Goodwill
          </Button>
        </div>
      </div>
    </Modal>
  );
};
