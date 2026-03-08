'use client';

import { RefreshCw, MessageCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActionType = 'follow-up' | 'new-reading' | 'end-session';

interface ReadingActionsProps {
  remainingFollowUps: number;
  maxFollowUps: number;
  onAction: (action: ActionType) => void;
  disabled?: boolean;
  className?: string;
  isExpired?: boolean;
}

export function ReadingActions({
  remainingFollowUps,
  maxFollowUps,
  onAction,
  disabled,
  className,
  isExpired,
}: ReadingActionsProps) {
  const canFollowUp = remainingFollowUps > 0 && !isExpired;

  return (
    <div className={cn(
      "w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4",
      className
    )}>
      {/* Ask Follow-up Question */}
      <ActionButton
        icon={MessageCircle}
        label="ถามต่อ"
        description={`เหลือ ${remainingFollowUps}/${maxFollowUps}`}
        onClick={() => onAction('follow-up')}
        disabled={disabled || !canFollowUp}
        variant="primary"
        isExpired={isExpired && remainingFollowUps > 0}
      />

      {/* Start New Reading */}
      <ActionButton
        icon={RefreshCw}
        label="เปิดใหม่"
        description="เริ่มดูดวงรอบใหม่"
        onClick={() => onAction('new-reading')}
        disabled={disabled}
        variant="secondary"
      />

      {/* End Session */}
      <ActionButton
        icon={Home}
        label="จบการดู"
        description="กลับหน้าแรก"
        onClick={() => onAction('end-session')}
        disabled={disabled}
        variant="ghost"
      />
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  variant: 'primary' | 'secondary' | 'ghost';
  isExpired?: boolean;
}

function ActionButton({
  icon: Icon,
  label,
  description,
  onClick,
  disabled,
  variant,
  isExpired,
}: ActionButtonProps) {
  const variants = {
    primary: {
      wrapper: disabled
        ? "bg-indigo-900/30 border-indigo-800 cursor-not-allowed"
        : isExpired
        ? "bg-red-500/20 border-red-500/50 animate-pulse"
        : "bg-gradient-to-r from-amber-500 to-orange-500 border-transparent hover:from-amber-400 hover:to-orange-400 hover:scale-105 shadow-lg shadow-amber-500/25",
      text: disabled
        ? "text-indigo-500"
        : isExpired
        ? "text-red-200"
        : "text-indigo-950",
      desc: disabled
        ? "text-indigo-600"
        : isExpired
        ? "text-red-300/70"
        : "text-indigo-900/70",
      icon: disabled
        ? "text-indigo-600"
        : isExpired
        ? "text-red-400"
        : "text-indigo-950",
    },
    secondary: {
      wrapper: disabled
        ? "bg-indigo-900/30 border-indigo-800 cursor-not-allowed"
        : "bg-indigo-900/50 border-amber-600/50 hover:bg-indigo-800/50 hover:border-amber-500/50 hover:scale-105",
      text: disabled ? "text-indigo-500" : "text-amber-200",
      desc: disabled ? "text-indigo-600" : "text-amber-300/60",
      icon: disabled ? "text-indigo-600" : "text-amber-400",
    },
    ghost: {
      wrapper: disabled
        ? "bg-transparent border-indigo-800 cursor-not-allowed"
        : "bg-transparent border-indigo-700/50 hover:bg-indigo-900/30 hover:border-indigo-600 hover:scale-105",
      text: disabled ? "text-indigo-600" : "text-indigo-300",
      desc: disabled ? "text-indigo-700" : "text-indigo-400/60",
      icon: disabled ? "text-indigo-700" : "text-indigo-400",
    },
  };

  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex flex-col items-center gap-1 px-6 py-3 sm:px-8 sm:py-4 rounded-xl",
        "border-2 transition-all duration-200",
        "w-full sm:w-auto min-w-[100px]",
        v.wrapper
      )}
    >
      <Icon className={cn("w-6 h-6 mb-1 transition-transform", v.icon)} />
      <span className={cn("font-semibold", v.text)}>
        {label}
      </span>
      <span className={cn("text-xs", v.desc)}>
        {isExpired && variant === 'primary' ? 'หมดเวลาเซสชัน' : description}
      </span>
    </button>
  );
}

// Compact version for inline display
export function ReadingActionsCompact({
  remainingFollowUps,
  onAction,
  disabled,
  className,
}: Omit<ReadingActionsProps, 'isExpired' | 'maxFollowUps'>) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CompactButton
        icon={MessageCircle}
        label={`ถามต่อ (${remainingFollowUps})`}
        onClick={() => onAction('follow-up')}
        disabled={disabled || remainingFollowUps <= 0}
        variant="primary"
      />
      <CompactButton
        icon={RefreshCw}
        label="ใหม่"
        onClick={() => onAction('new-reading')}
        disabled={disabled}
        variant="secondary"
      />
      <CompactButton
        icon={Home}
        label="จบ"
        onClick={() => onAction('end-session')}
        disabled={disabled}
        variant="ghost"
      />
    </div>
  );
}

type CompactButtonProps = Omit<ActionButtonProps, 'description' | 'isExpired'>;

function CompactButton({ icon: Icon, label, onClick, disabled, variant }: CompactButtonProps) {
  const variants = {
    primary: disabled
      ? "bg-indigo-900/30 text-indigo-500 border-indigo-800"
      : "bg-amber-500 text-indigo-950 border-amber-500 hover:bg-amber-400",
    secondary: disabled
      ? "bg-indigo-900/30 text-indigo-500 border-indigo-800"
      : "bg-indigo-800/50 text-amber-200 border-amber-600/50 hover:bg-indigo-700/50",
    ghost: disabled
      ? "bg-transparent text-indigo-600 border-indigo-800"
      : "bg-transparent text-indigo-300 border-indigo-700/50 hover:bg-indigo-900/30",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
        "text-sm font-medium border transition-all",
        variants[variant]
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
