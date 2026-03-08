'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Sparkles } from 'lucide-react';
import { SelectedCard, SpreadType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SelectionPanelProps {
  selectedCards: SelectedCard[];
  maxSelection: number;
  spreadType: SpreadType;
  onRemove: (index: number) => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export function SelectionPanel({
  selectedCards,
  maxSelection,
  spreadType,
  onRemove,
  onComplete,
  isLoading,
}: SelectionPanelProps) {
  const isComplete = selectedCards.length === maxSelection;
  const progress = (selectedCards.length / maxSelection) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Header with Counter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Counter Badge */}
          <div className="flex items-center gap-2 bg-indigo-950/60 px-4 py-2 rounded-full border border-amber-600/30">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-100 font-medium">
              {selectedCards.length}/{maxSelection} ใบที่เลือก
            </span>
          </div>
          
          {/* Progress Bar (Desktop) */}
          <div className="hidden sm:block w-32 h-2 bg-indigo-950 rounded-full overflow-hidden border border-indigo-800">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>
        </div>

        {/* Spread Type Label */}
        <div className="text-sm text-amber-200/60">
          {spreadType.nameTh}
        </div>
      </div>

      {/* Selection Slots */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Array.from({ length: maxSelection }).map((_, index) => {
          const card = selectedCards[index];
          const positionName = spreadType.positionsTh[index] || `ใบที่ ${index + 1}`;
          
          return (
            <SelectionSlot
              key={index}
              card={card}
              index={index}
              positionName={positionName}
              onRemove={() => onRemove(index)}
            />
          );
        })}
      </div>

      {/* Complete Button */}
      <motion.button
        onClick={onComplete}
        disabled={!isComplete || isLoading}
        className={cn(
          "w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300",
          "flex items-center justify-center gap-2",
          isComplete
            ? "bg-gradient-to-r from-amber-500 to-amber-400 text-indigo-950 hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/25 cursor-pointer"
            : "bg-indigo-950/60 text-indigo-400 border-2 border-indigo-800 cursor-not-allowed"
        )}
        whileHover={isComplete ? { scale: 1.01 } : {}}
        whileTap={isComplete ? { scale: 0.99 } : {}}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-indigo-950/30 border-t-indigo-950 rounded-full animate-spin" />
            <span>กำลังดำเนินการ...</span>
          </>
        ) : isComplete ? (
          <>
            <Sparkles className="w-5 h-5" />
            <span>🔮 ดูผลลัพธ์การอ่านไพ่</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>เลือกไพ่ให้ครบ {maxSelection} ใบก่อน</span>
          </>
        )}
      </motion.button>

      {/* Mobile Progress */}
      <div className="sm:hidden mt-4 h-1.5 bg-indigo-950 rounded-full overflow-hidden border border-indigo-800">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}

interface SelectionSlotProps {
  card: SelectedCard | null;
  index: number;
  positionName: string;
  onRemove: () => void;
}

function SelectionSlot({ card, index, positionName, onRemove }: SelectionSlotProps) {
  return (
    <div className="relative">
      {/* Position Label */}
      <div className="text-center mb-1.5">
        <span className={cn(
          "text-xs font-medium uppercase tracking-wider",
          card ? "text-amber-400" : "text-indigo-400"
        )}>
          {positionName}
        </span>
      </div>

      {/* Slot */}
      <AnimatePresence mode="wait">
        {card ? (
          <motion.div
            key="filled"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="relative aspect-[2/3] rounded-xl overflow-hidden border-2 border-amber-500 shadow-lg shadow-amber-500/20 bg-indigo-900"
          >
            {/* Card Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
              {/* Card Number */}
              <span className="text-3xl font-bold text-amber-500/40 mb-1">
                {card.number}
              </span>
              
              {/* Card Name */}
              <p className="text-xs text-amber-100 font-medium text-center leading-tight">
                {card.nameTh}
              </p>
              
              {/* Orientation */}
              <p className="text-[10px] text-amber-300/60 mt-1">
                {card.isReversed ? '🔃 กลับหัว' : '⬆️ ตรง'}
              </p>
            </div>

            {/* Frame */}
            <div className="absolute inset-1.5 border border-amber-500/30 rounded-lg" />

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-colors shadow-md"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Selection Order Badge */}
            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-amber-500 text-indigo-950 text-xs font-bold flex items-center justify-center shadow-md">
              {index + 1}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="aspect-[2/3] rounded-xl border-2 border-dashed border-indigo-700 bg-indigo-950/50 flex flex-col items-center justify-center gap-1.5"
          >
            <span className="text-2xl text-indigo-600">?</span>
            <span className="text-xs text-indigo-500">รอเลือก</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
