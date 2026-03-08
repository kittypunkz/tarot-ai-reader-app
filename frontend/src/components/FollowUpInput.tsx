'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import { MiniCardPreview } from './MiniCardPreview';
import { SelectedCard } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FollowUpInputProps {
  previousCards: SelectedCard[];
  positions: string[];
  followUpCount: number;
  maxFollowUps: number;
  onSubmit: (question: string) => void | Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export function FollowUpInput({
  previousCards,
  positions,
  followUpCount,
  maxFollowUps,
  onSubmit,
  onBack,
  isLoading,
  error,
  onClearError,
}: FollowUpInputProps) {
  const [question, setQuestion] = useState('');
  const remaining = maxFollowUps - followUpCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    
    // Clear previous error before submitting
    onClearError?.();
    
    await onSubmit(question.trim());
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    // Clear error when user starts typing
    if (error) {
      onClearError?.();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="p-2 rounded-full bg-indigo-900/50 text-amber-400 hover:bg-indigo-800 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-semibold text-amber-100">
            ถามคำถามต่อเนื่อง
          </h2>
          <p className="text-sm text-amber-200/60">
            เหลือ {remaining} ครั้ง
          </p>
        </div>
      </div>

      {/* Previous Cards Preview */}
      <div className="mb-6 p-4 bg-indigo-950/50 rounded-xl border border-amber-600/20">
        <MiniCardPreview 
          cards={previousCards} 
          positions={positions}
        />
        <p className="text-center text-xs text-amber-200/40 mt-3">
          AI จะพิจารณาบริบทจากไพ่ที่เปิดไปแล้ว
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={onClearError}
              className="text-red-400/70 text-xs hover:text-red-300 mt-1 underline"
            >
              ลองอีกครั้ง
            </button>
          </div>
        </div>
      )}

      {/* Question Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={question}
            onChange={handleQuestionChange}
            placeholder="ถามคำถามต่อ... (เช่น แล้วถ้าได้งาน เงินเดือนจะดีขึ้นไหม?)"
            className={cn(
              "w-full min-h-[120px] p-4 rounded-xl resize-none",
              "bg-indigo-950/50 border-2 transition-all",
              "text-amber-100 placeholder-amber-200/30",
              "focus:outline-none focus:ring-2",
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                : "border-amber-600/30 focus:border-amber-500 focus:ring-amber-500/20"
            )}
            maxLength={300}
            disabled={isLoading}
          />
          <div className="absolute bottom-3 right-3 text-xs text-amber-200/40">
            {question.length}/300
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!question.trim() || isLoading}
          className={cn(
            "w-full py-4 rounded-xl font-semibold transition-all",
            "flex items-center justify-center gap-2",
            question.trim() && !isLoading
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-indigo-950 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25"
              : "bg-indigo-900/50 text-indigo-400 border-2 border-indigo-800 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-indigo-950/30 border-t-indigo-950 rounded-full animate-spin" />
              <span>กำลังส่ง...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>ส่งคำถามต่อเนื่อง</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Tips */}
      <div className="mt-6 p-4 bg-indigo-900/30 rounded-xl border border-indigo-700/30">
        <p className="text-sm text-indigo-300/70 mb-2">
          💡 เคล็ดลับการถามต่อ:
        </p>
        <ul className="text-xs text-indigo-300/50 space-y-1 list-disc list-inside">
          <li>ถามให้เฉพาะเจาะจงขึ้น เช่น &ldquo;แล้วถ้า...จะ...ไหม?&rdquo;</li>
          <li>อ้างอิงจากผลไพ่ที่เพิ่งได้รับ</li>
          <li>ถามเกี่ยวกับมิติอื่นของเรื่องเดียวกัน</li>
        </ul>
      </div>
    </div>
  );
}
