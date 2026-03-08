/**
 * API Client for Ask The Tarot
 * US-001: Question Validation API
 * US-002: Card Drawing API
 * US-003: Follow-up Questions API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============== US-001: Question Validation ==============

export interface ValidationResult {
  status: "approved" | "rejected" | "clarification_needed";
  confidence: number;
  category?: "career" | "love" | "health" | "general" | "finance" | "relationship";
  question_type?: "yes_no" | "open_ended" | "advice";
  suggested_spread: number;
  reason?: "inappropriate_content" | "too_short" | "spam" | "unclear";
  message?: string;
  suggestion?: string;
  examples?: string[];
}

export interface ValidateQuestionRequest {
  question: string;
  session_id?: string;
  language: string;
}

// ============== US-002: Card Drawing ==============

export type SpreadType = "single" | "three_ppf" | "three_mpc" | "celtic_cross";
export type CardOrientation = "upright" | "reversed";

export interface SpreadInfo {
  spread_type: SpreadType;
  name: string;
  name_th: string;
  card_count: number;
  description?: string;
  description_th?: string;
  positions: string[];
  positions_th: string[];
}

export interface DrawnCard {
  position: number;
  position_name: string;
  position_name_th: string;
  card_id: string;
  card_name: string;
  card_name_th: string;
  orientation: CardOrientation;
  keywords: string[];
  keywords_th: string[];
  meaning: string;
  meaning_th: string;
  image_url?: string;
}

export interface DrawCardsRequest {
  session_id: string;
  spread_type: SpreadType;
  question: string;
  language: string;
}

export interface DrawCardsResponse {
  reading_id: string;
  session_id: string;
  spread: SpreadInfo;
  cards: DrawnCard[];
  question: string;
  interpretation?: string;  // AI interpretation (English)
  interpretation_th?: string;  // AI interpretation (Thai)
  created_at: string;
}

export interface SpreadSuggestion {
  question_type: string;
  suggested_spread: {
    type: SpreadType;
    name: string;
    name_th: string;
    card_count: number;
  };
}

// ============== US-003: Follow-up Questions ==============

export interface FollowUpRequest {
  session_id: string;
  question: string;
  previous_reading_id: string;
  language: string;
}

export interface FollowUpResponse {
  follow_up_id: string;
  session_id: string;
  previous_reading_id: string;
  new_reading_id: string;
  question: string;
  response: string;
  context_summary: string;
  cards: DrawnCard[];
  follow_up_count: number;
  remaining_follow_ups: number;
  max_follow_ups: number;
  created_at: string;
}

export interface Interaction {
  id: string;
  interaction_type: "initial" | "follow_up";
  question: string;
  question_category?: string;
  reading_id?: string;
  sequence_number: number;
  context_summary?: string;
  created_at: string;
}

export interface SessionInfo {
  session_id: string;
  status: "active" | "completed" | "expired";
  follow_up_count: number;
  remaining_follow_ups: number;
  max_follow_ups: number;
  created_at: string;
  last_interaction_at: string;
  expires_at: string;
  is_expired: boolean;
}

export interface SessionHistoryResponse {
  session: SessionInfo;
  interactions: Interaction[];
}

// ============== Session Management ==============

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = localStorage.getItem("tarot_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("tarot_session_id", sessionId);
  }
  return sessionId;
}

// ============== US-001: Question Validation API ==============

/**
 * Validate a question through the AI Gatekeeper
 */
export async function validateQuestion(
  question: string,
  language: string = "th"
): Promise<ValidationResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/validate-question`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    body: JSON.stringify({
      question,
      session_id: getSessionId(),
      language,
    } as ValidateQuestionRequest),
  });

  if (!response.ok) {
    if (response.status === 429) {
      const error = await response.json();
      throw new Error(error.detail?.message || "กรุณารอสักครู่ก่อนถามคำถามถัดไป");
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ============== US-002: Card Drawing API ==============

/**
 * Draw tarot cards
 */
export async function drawCards(
  question: string,
  spreadType: SpreadType = "single",
  language: string = "th"
): Promise<DrawCardsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/draw-cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    body: JSON.stringify({
      session_id: getSessionId(),
      spread_type: spreadType,
      question,
      language,
    } as DrawCardsRequest),
  });

  if (!response.ok) {
    if (response.status === 429) {
      const error = await response.json();
      throw new Error(error.detail?.message || "กรุณารอสักครู่ก่อนเปิดไพ่อีกครั้ง");
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get available spreads
 */
export async function getSpreads(): Promise<{ spreads: SpreadInfo[] }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/spreads`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get a reading by ID
 */
export async function getReading(readingId: string): Promise<DrawCardsResponse | null> {
  const sessionId = getSessionId();
  const response = await fetch(
    `${API_BASE_URL}/api/v1/readings/${readingId}?session_id=${sessionId}`
  );
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get spread suggestion based on question type
 */
export async function suggestSpread(
  questionType: string
): Promise<SpreadSuggestion> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/suggest-spread?question_type=${questionType}`
  );
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ============== US-003: Follow-up Questions API ==============

/**
 * Create a follow-up question
 */
export async function createFollowUp(
  sessionId: string,
  question: string,
  previousReadingId: string,
  language: string = "th"
): Promise<FollowUpResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/follow-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    },
    body: JSON.stringify({
      session_id: sessionId,
      question,
      previous_reading_id: previousReadingId,
      language,
    } as FollowUpRequest),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 429) {
      throw new Error(errorData.detail?.message || "กรุณารอสักครู่ก่อนถามต่อ");
    }
    
    if (response.status === 403) {
      throw new Error(errorData.detail?.message || "เซสชันหมดเวลาหรือถามต่อครบจำนวนแล้ว");
    }
    
    throw new Error(errorData.detail?.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get session history with all interactions
 */
export async function getSessionHistory(
  sessionId: string
): Promise<SessionHistoryResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/sessions/${sessionId}/history`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("ไม่พบเซสชัน");
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get current session info
 */
export async function getSessionInfo(
  sessionId: string
): Promise<SessionInfo> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/sessions/${sessionId}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("ไม่พบเซสชัน");
    }
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// ============== Utility ==============

/**
 * Check API health
 */
export async function checkHealth(): Promise<{ status: string; version: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("API is not healthy");
  }
  return response.json();
}

/**
 * Store reading in localStorage for navigation
 */
export function storeReading(reading: DrawCardsResponse | FollowUpResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("tarot_current_reading", JSON.stringify(reading));
}

/**
 * Get stored reading from localStorage
 */
export function getStoredReading(): DrawCardsResponse | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("tarot_current_reading");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear stored reading
 */
export function clearStoredReading(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("tarot_current_reading");
}

// ============== API Object (for hooks) ==============

export const api = {
  followUp: {
    create: createFollowUp,
  },
  sessions: {
    getHistory: getSessionHistory,
    getInfo: getSessionInfo,
  },
  readings: {
    draw: drawCards,
    get: getReading,
  },
};
