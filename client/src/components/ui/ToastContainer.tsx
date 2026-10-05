import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle2, AlertTriangle, Info, Heart, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-slate-900 text-white border-slate-800';
        let Icon = Info;

        if (toast.type === 'success') {
          bgClass = 'bg-slate-900 text-white border-emerald-500/30';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-950 text-white border-rose-500/30';
          Icon = AlertTriangle;
        } else if (toast.type === 'goodwill') {
          bgClass = 'bg-emerald-950 text-white border-emerald-400/40';
          Icon = Heart;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md ${bgClass} animate-in slide-in-from-bottom-5 duration-200`}
          >
            <Icon
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                toast.type === 'goodwill' ? 'text-emerald-400 fill-emerald-400/20' : 'text-emerald-400'
              }`}
            />
            <div className="flex-1 text-sm leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
