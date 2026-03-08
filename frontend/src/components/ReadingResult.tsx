'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SessionTimer } from './SessionTimer';
import { ReadingActions, ActionType } from './ReadingActions';
import { FollowUpInput } from './FollowUpInput';
import { MiniCardPreview } from './MiniCardPreview';
import { CardGrid } from './CardDisplay';
import { SelectedCard } from '@/lib/types';
import { FollowUpResponse } from '@/lib/api';

interface ReadingResultProps {
  sessionId: string;
  readingId: string;
  question: string;
  cards: SelectedCard[];
  positions: string[];
  interpretation: string;
  followUpCount: number;
  maxFollowUps: number;
  createdAt: string;
  onNewReading?: () => void;
}

type ResultView = 'result' | 'follow-up';

export function ReadingResult({
  sessionId,
  readingId,
  question,
  cards,
  positions,
  interpretation,
  followUpCount,
  maxFollowUps,
  createdAt,
  onNewReading,
}: ReadingResultProps) {
  const router = useRouter();
  const [view, setView] = useState<ResultView>('result');
  const [isExpired, setIsExpired] = useState(false);
  const [currentFollowUpCount, setCurrentFollowUpCount] = useState(followUpCount);
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const remainingFollowUps = maxFollowUps - currentFollowUpCount;

  // Handle action button clicks
  const handleAction = useCallback((action: ActionType) => {
    switch (action) {
      case 'follow-up':
        setView('follow-up');
        break;
      case 'new-reading':
        if (onNewReading) {
          onNewReading();
        } else {
          router.push('/');
        }
        break;
      case 'end-session':
        router.push('/');
        break;
    }
  }, [router, onNewReading]);

  // Clear submit error
  const handleClearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  // Handle follow-up submission
  const handleFollowUpSubmit = useCallback(async (followUpQuestion: string) => {
    if (!sessionId || !readingId) return;

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Call API to create follow-up
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          question: followUpQuestion,
          previous_reading_id: readingId,
          language: 'th',
        }),
      });

      if (!response.ok) {
        let errorMessage = 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail?.message || errorData.message || `ข้อผิดพลาด ${response.status}`;
        } catch {
          errorMessage = `ข้อผิดพลาด ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result: FollowUpResponse = await response.json();
      
      // Update state
      setFollowUpHistory(prev => [...prev, result]);
      setCurrentFollowUpCount(result.follow_up_count);
      setView('result');
      
      // Scroll to the new response
      setTimeout(() => {
        const element = document.getElementById(`follow-up-${result.follow_up_id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
    } catch (err) {
      console.error('Follow-up error:', err);
      setSubmitError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId, readingId]);

  // Handle session expiration
  const handleSessionExpired = useCallback(() => {
    setIsExpired(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-4 md:p-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-amber-200/70 hover:text-amber-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>กลับ</span>
          </button>

          <div className="text-center">
            <h1 className="text-xl font-bold text-amber-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              ผลการอ่านไพ่
            </h1>
          </div>

          {/* Session Timer */}
          <SessionTimer
            sessionId={sessionId}
            createdAt={createdAt}
            expirationMinutes={1440} // 24 hours for testing
            onExpired={handleSessionExpired}
          />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-4 py-6 max-w-4xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {view === 'result' ? (
              <motion.div
                key="result"
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Question */}
                <div className="text-center">
                  <p className="text-amber-200/60 text-sm mb-2">คำถามของคุณ</p>
                  <p className="text-amber-100 text-xl font-medium leading-relaxed">
                    &ldquo;{question}&rdquo;
                  </p>
                </div>

                {/* Cards Display - Real Card Data */}
                <div className="p-6 bg-indigo-900/30 rounded-2xl border border-amber-600/20">
                  <CardGrid
                    cards={cards}
                    positions={positions}
                  />
                </div>

                {/* Interpretation */}
                <div className="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-amber-600/20">
                  <h2 className="text-lg font-semibold text-amber-200 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    คำทำนาย
                  </h2>
                  <div className="prose prose-invert prose-amber max-w-none">
                    <p className="text-amber-100/90 leading-relaxed whitespace-pre-wrap">
                      {interpretation}
                    </p>
                  </div>
                </div>

                {/* Follow-up History */}
                {followUpHistory.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-amber-200/80 font-medium flex items-center gap-2">
                      <span className="w-8 h-px bg-amber-600/50" />
                      คำถามต่อเนื่อง
                      <span className="w-8 h-px bg-amber-600/50" />
                    </h3>
                    
                    {followUpHistory.map((followUp, index) => (
                      <motion.div
                        key={followUp.follow_up_id}
                        id={`follow-up-${followUp.follow_up_id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 bg-indigo-950/50 rounded-xl border border-indigo-700/30"
                      >
                        {/* Question */}
                        <div className="mb-3">
                          <span className="text-xs text-amber-400/60 uppercase tracking-wider">
                            ถามต่อ #{index + 1}
                          </span>
                          <p className="text-amber-100 font-medium mt-1">
                            &ldquo;{followUp.question}&rdquo;
                          </p>
                        </div>
                        
                        {/* Answer */}
                        <div className="p-4 bg-indigo-900/30 rounded-lg">
                          <p className="text-amber-200/80 text-sm leading-relaxed">
                            {followUp.response}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Expiration Warning */}
                {isExpired && remainingFollowUps > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">
                      เซสชันหมดเวลาแล้ว คุณไม่สามารถถามต่อได้อีก
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-amber-600/20">
                  <p className="text-center text-amber-200/60 text-sm mb-4">
                    ต้องการถามต่อหรือไม่?
                  </p>
                  <ReadingActions
                    remainingFollowUps={remainingFollowUps}
                    maxFollowUps={maxFollowUps}
                    onAction={handleAction}
                    isExpired={isExpired}
                  />
                </div>
              </motion.div>
            ) : (
              /* Follow-up Input View */
              <motion.div
                key="follow-up"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <FollowUpInput
                  previousCards={cards}
                  positions={positions}
                  followUpCount={currentFollowUpCount}
                  maxFollowUps={maxFollowUps}
                  onSubmit={handleFollowUpSubmit}
                  onBack={() => setView('result')}
                  isLoading={isSubmitting}
                  error={submitError}
                  onClearError={handleClearError}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center">
          <p className="text-amber-400/30 text-xs">
            ไพ่ทาโรต์เป็นเครื่องมือช่วยนำทาง การตัดสินใจขึ้นอยู่กับคุณ
          </p>
        </footer>
      </div>
    </div>
  );
}
