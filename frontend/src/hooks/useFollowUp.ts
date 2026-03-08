'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { SelectedCard } from '@/lib/types';
import { FollowUpResponse, SessionHistoryResponse } from '@/lib/api';

interface UseFollowUpOptions {
  sessionId: string;
  previousReadingId: string;
  onSuccess?: (response: FollowUpResponse) => void;
  onError?: (error: Error) => void;
}

export function useFollowUp({ sessionId, previousReadingId, onSuccess, onError }: UseFollowUpOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<FollowUpResponse | null>(null);

  const submitFollowUp = useCallback(async (question: string) => {
    if (!sessionId || !question.trim() || !previousReadingId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.followUp.create(sessionId, question, previousReadingId);
      setLastResponse(response);
      onSuccess?.(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(message);
      onError?.(err instanceof Error ? err : new Error(message));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, previousReadingId, onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResponse = useCallback(() => {
    setLastResponse(null);
  }, []);

  return {
    submitFollowUp,
    isLoading,
    error,
    lastResponse,
    clearError,
    clearResponse,
  };
}

// Hook for fetching session history
export function useSessionHistory(sessionId: string) {
  const [history, setHistory] = useState<SessionHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.sessions.getHistory(sessionId);
      setHistory(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'โหลดประวัติไม่สำเร็จ';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearHistory = useCallback(() => {
    setHistory(null);
  }, []);

  return {
    history,
    isLoading,
    error,
    fetchHistory,
    clearHistory,
    refresh: fetchHistory,
  };
}

// Hook to check if follow-up is available
export function useFollowUpStatus(
  sessionId: string,
  followUpCount: number,
  maxFollowUps: number = 3,
  createdAt?: string
) {
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const canFollowUp = followUpCount < maxFollowUps && !isExpired;
  const remainingFollowUps = maxFollowUps - followUpCount;

  // Check expiration (30 minutes from session creation)
  const checkExpiration = useCallback(() => {
    if (!createdAt) return;
    
    const created = new Date(createdAt).getTime();
    const now = Date.now();
    const expirationMs = 1440 * 60 * 1000; // 24 hours for testing
    const elapsed = now - created;
    const remaining = Math.max(0, expirationMs - elapsed);
    
    setTimeLeft(remaining);
    setIsExpired(remaining <= 0);
  }, [createdAt]);

  return {
    canFollowUp,
    remainingFollowUps,
    isExpired,
    timeLeft,
    checkExpiration,
  };
}

// Combined hook for full follow-up flow
interface UseFollowUpFlowOptions {
  sessionId: string;
  previousReadingId: string;
  cards: SelectedCard[];
  positions: string[];
}

export function useFollowUpFlow({
  sessionId,
  previousReadingId,
  cards,
  positions,
}: UseFollowUpFlowOptions) {
  const [showInput, setShowInput] = useState(false);
  
  const {
    submitFollowUp,
    isLoading,
    error,
    lastResponse,
    clearError,
  } = useFollowUp({
    sessionId,
    previousReadingId,
    onSuccess: () => setShowInput(false),
  });

  const startFollowUp = useCallback(() => {
    setShowInput(true);
  }, []);

  const cancelFollowUp = useCallback(() => {
    setShowInput(false);
    clearError();
  }, [clearError]);

  return {
    showInput,
    startFollowUp,
    cancelFollowUp,
    submitFollowUp,
    isLoading,
    error,
    lastResponse,
    clearError,
    // Context for input display
    context: {
      cards,
      positions,
      previousResponse: lastResponse,
    },
  };
}
