'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionTimerProps {
  sessionId: string;
  createdAt: string; // ISO string
  expirationMinutes?: number;
  onExpired?: () => void;
  className?: string;
}

interface TimeLeft {
  minutes: number;
  seconds: number;
  totalMs: number;
  percentage: number;
}

function calculateTimeLeft(createdAt: string, expirationMinutes: number): TimeLeft {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const expires = created + expirationMinutes * 60 * 1000;
  const totalMs = Math.max(0, expires - now);
  
  const minutes = Math.floor(totalMs / 1000 / 60);
  const seconds = Math.floor((totalMs / 1000) % 60);
  
  const totalDuration = expirationMinutes * 60 * 1000;
  const percentage = Math.max(0, Math.min(100, (totalMs / totalDuration) * 100));
  
  return { minutes, seconds, totalMs, percentage };
}

// Hook to detect if we're on the client
function useIsClient() {
  return useSyncExternalStore(
    () => () => {}, // no-op subscription
    () => true, // client value
    () => false // server value
  );
}

export function SessionTimer({
  sessionId: _sessionId,
  createdAt,
  expirationMinutes = 1440, // 24 hours for testing
  onExpired,
  className,
}: SessionTimerProps) {
  const isClient = useIsClient();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => 
    calculateTimeLeft(createdAt, expirationMinutes)
  );

  // Update timer every second
  useEffect(() => {
    if (!isClient) return;
    
    const updateTimer = () => {
      const newTimeLeft = calculateTimeLeft(createdAt, expirationMinutes);
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.totalMs <= 0 && onExpired) {
        onExpired();
      }
    };
    
    // Initial update
    updateTimer();
    
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isClient, createdAt, expirationMinutes, onExpired]);

  // Don't render during SSR
  if (!isClient) return null;

  // Expired state
  if (timeLeft.totalMs <= 0) {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-red-500/20 text-red-300 border border-red-500/30",
        className
      )}>
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">หมดเวลาเซสชัน</span>
      </div>
    );
  }

  const showWarning = timeLeft.totalMs < 5 * 60 * 1000;
  const formatTime = (m: number, s: number) => `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <div className={cn(
      "inline-flex items-center gap-3 px-4 py-2 rounded-full",
      "bg-indigo-900/50 border transition-colors",
      showWarning 
        ? "border-red-500/50 bg-red-500/10" 
        : "border-amber-600/30",
      className
    )}>
      {/* Icon */}
      <Clock className={cn(
        "w-4 h-4",
        showWarning ? "text-red-400" : "text-amber-400"
      )} />
      
      {/* Time Display */}
      <span className={cn(
        "text-sm font-mono font-medium tabular-nums",
        showWarning ? "text-red-300" : "text-amber-200"
      )}>
        {formatTime(timeLeft.minutes, timeLeft.seconds)}
      </span>
      
      {/* Progress Bar (small) */}
      <div className="w-16 h-1.5 bg-indigo-800/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            showWarning ? "bg-red-500" : "bg-amber-500"
          )}
          style={{ width: `${timeLeft.percentage}%` }}
        />
      </div>
      
      {/* Warning Icon */}
      {showWarning && (
        <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
      )}
    </div>
  );
}

// Simplified version for compact display
export function SessionTimerCompact({
  createdAt,
  expirationMinutes = 1440, // 24 hours for testing
  className,
}: Omit<SessionTimerProps, 'sessionId' | 'onExpired'>) {
  const isClient = useIsClient();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => 
    calculateTimeLeft(createdAt, expirationMinutes)
  );

  useEffect(() => {
    if (!isClient) return;
    
    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft(createdAt, expirationMinutes));
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isClient, createdAt, expirationMinutes]);

  if (!isClient) return null;

  const formatTime = (m: number, s: number) => `${m}:${s.toString().padStart(2, '0')}`;

  return (
    <span className={cn(
      "text-xs font-mono tabular-nums",
      timeLeft.totalMs < 5 * 60 * 1000 ? "text-red-400" : "text-amber-200/60",
      className
    )}>
      {formatTime(timeLeft.minutes, timeLeft.seconds)}
    </span>
  );
}
