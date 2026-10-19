import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { ITimeWindow } from '../../types';

interface TimeWindowPickerProps {
  value: ITimeWindow;
  onChange: (timeWindow: ITimeWindow) => void;
  required?: boolean;
  className?: string;
}

export const formatDisplayTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
};

export const calculateDurationHours = (startTime: string, endTime: string): number | null => {
  if (!startTime || !endTime) return null;
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return null;

  const startMinutes = sH * 60 + sM;
  const endMinutes = eH * 60 + eM;
  const diffMinutes = endMinutes - startMinutes;

  if (diffMinutes <= 0) return null;
  return Number((diffMinutes / 60).toFixed(1));
};

export const TimeWindowPicker: React.FC<TimeWindowPickerProps> = ({
  value,
  onChange,
  required = true,
  className = '',
}) => {
  const [startTime, setStartTime] = useState(value?.startTime || '09:00');
  const [endTime, setEndTime] = useState(value?.endTime || '12:00');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      if (value.startTime) setStartTime(value.startTime);
      if (value.endTime) setEndTime(value.endTime);
    }
  }, [value?.startTime, value?.endTime]);

  const validateAndUpdate = (newStart: string, newEnd: string) => {
    if (!newStart || !newEnd) {
      if (required) {
        setError('Both start time and end time are required');
      } else {
        setError(null);
      }
      onChange({ startTime: newStart, endTime: newEnd });
      return;
    }

    if (newEnd <= newStart) {
      setError('End time must be later than start time');
    } else {
      setError(null);
    }

    onChange({ startTime: newStart, endTime: newEnd });
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartTime(newStart);
    validateAndUpdate(newStart, endTime);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setEndTime(newEnd);
    validateAndUpdate(startTime, newEnd);
  };

  const applyPreset = (start: string, end: string) => {
    setStartTime(start);
    setEndTime(end);
    validateAndUpdate(start, end);
  };

  const duration = calculateDurationHours(startTime, endTime);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          Preferred Time Window {required && <span className="text-rose-400">*</span>}
        </label>
        {duration !== null && !error && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {formatDisplayTime(startTime)} – {formatDisplayTime(endTime)} ({duration}h)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Start Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="time"
              value={startTime}
              onChange={handleStartChange}
              required={required}
              className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">End Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="time"
              value={endTime}
              onChange={handleEndChange}
              required={required}
              className={`w-full pl-9 pr-3 py-2 bg-slate-900/60 border rounded-xl text-white text-sm focus:outline-none transition-all cursor-pointer ${
                error
                  ? 'border-rose-500/60 focus:ring-2 focus:ring-rose-500/40'
                  : 'border-slate-700/60 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Preset shortcuts */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-xs text-slate-400 mr-1">Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset('09:00', '12:00')}
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
        >
          Morning (9am-12pm)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('13:00', '16:00')}
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
        >
          Afternoon (1pm-4pm)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('17:00', '20:00')}
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
        >
          Evening (5pm-8pm)
        </button>
        <button
          type="button"
          onClick={() => applyPreset('09:00', '18:00')}
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
        >
          Full Day
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
