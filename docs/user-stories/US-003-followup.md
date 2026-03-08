# US-003: Follow-up Questions & Session Continuity

**Epic:** User Engagement  
**Priority:** P1  
**Status:** 🚧 In Progress  
**Sprint:** 3  
**Depends on:** US-001, US-002  
**Blocks:** US-005  

---

## 📝 User Story

**As a** tarot seeker  
**I want** to ask follow-up questions after my reading  
**So that** I can explore my situation more deeply without starting over

---

## 🎯 Acceptance Criteria

### Must Have
- [ ] Show 3 action buttons after reading: "ถามต่อ", "เปิดใหม่", "จบการดู"
- [ ] Support up to 3 follow-up questions per session
- [ ] AI maintains context from previous readings
- [ ] Show mini card preview of previous reading
- [ ] Session expires after 30 minutes of inactivity
- [ ] Rate limiting: 5 min between follow-ups

### Nice to Have
- [ ] Session history timeline view
- [ ] Side-by-side card comparison for redraw
- [ ] Context summary tooltip

---

## 🎬 User Journey

### Main Flow: Follow-up Question
```
User sees reading result
    ↓
Clicks "ถามต่อ" (Ask Follow-up)
    ↓
Shows input screen with:
  - Mini preview of previous cards
  - Question input
  - Context indicator
    ↓
User types follow-up question
    ↓
AI validates with context
    ↓
Draw new cards (context-aware)
    ↓
Show connected reading
```

### Alternative: Redraw
```
User sees reading result
    ↓
Clicks "เปิดใหม่" (Redraw)
    ↓
Confirmation dialog
    ↓
Shuffle same question, new cards
    ↓
Show new reading with comparison hint
```

---

## 🛠️ Technical Implementation Plan

### Phase 1: Backend API
1. Update Session model with `follow_up_count`
2. Create Interactions table
3. Add `/api/v1/follow-up` endpoint
4. Update Gatekeeper to accept context
5. Add session history endpoint

### Phase 2: Frontend - Reading Result Screen
1. Add 3 action buttons after reading
2. Create mini card preview component
3. Build follow-up input screen
4. Add session timer/expiration warning

### Phase 3: Context Integration
1. Pass context to AI prompts
2. Show context summary in UI
3. Connect readings visually

---

## 📊 Data Model

### Session Update
```typescript
interface Session {
  id: string;
  follow_up_count: number;
  max_follow_ups: number;
  last_activity: Date;
  status: 'active' | 'completed' | 'expired';
}
```

### Interaction
```typescript
interface Interaction {
  id: string;
  session_id: string;
  type: 'initial' | 'follow_up';
  question: string;
  reading_id: string;
  sequence: number;
  created_at: Date;
}
```

---

## 🔌 API Endpoints

### POST /api/v1/follow-up
Request validation and context summary

### POST /api/v1/readings (update)
Accept `previous_reading_id` for context

### GET /api/v1/sessions/{id}/history
Get session timeline

---

## 🎨 UI Components Needed

1. **ReadingActions** - 3 buttons after reading
2. **MiniCardPreview** - Small card display
3. **FollowUpInput** - Chat-like input with context
4. **SessionTimer** - Expiration countdown
5. **ContextBadge** - Shows "มีบริบท" indicator

---

## 🚦 Definition of Done

- [ ] User can ask 3 follow-ups per session
- [ ] AI responses are context-aware
- [ ] UI shows previous cards
- [ ] Session expires properly
- [ ] Tests pass
- [ ] Documentation updated

---

**Implementation Start:** 2026-03-07  
**Estimated Duration:** 4 days
