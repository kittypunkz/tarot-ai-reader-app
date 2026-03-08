# Ask The Tarot - Complete User Stories

## Priority Order (Based on Dependencies)

```
US-001 (Foundation - No dependencies)
    ↓
US-002 (Depends on US-001)
    ↓
US-003 (Depends on US-001, US-002)
    ↓
US-005 (Depends on US-001, US-002, US-003)

US-004 (Non-functional - Parallel track)
```

---

## US-001: AI Gatekeeper - Content Filtering
**Priority: 1 (HIGHEST - Foundation)**
**Status: Not Started**

**As a** system administrator  
**I want** to filter inappropriate questions before processing  
**So that** we reduce AI costs and maintain quality user experience

### User Journey Flow
ผู้ใช้เปิดแอปและพบหน้า Input Screen ที่มีช่องให้กรอกคำถาม เมื่อผู้ใช้พิมพ์คำถามและกดปุ่ม "ถามแม่หมอ" ระบบจะส่งคำถามไปตรวจสอบที่ AI Gatekeeper ก่อน หากคำถามผ่านการตรวจสอบ จะเข้าสู่ขั้นตอนการเลือกไพ่ (US-002) หากไม่ผ่าน ระบบจะแสดงข้อความแจ้งเตือนพร้อมคำแนะนำให้ปรับคำถาม

### Scenarios

#### Happy Path: คำถามผ่านการตรวจสอบ
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้พิมพ์คำถาม "งานใหม่ที่ไปสัมภาษณ์จะได้ไหม?" | แสดงข้อความในช่อง Input | Text Input (ขนาดใหญ่, กลางจอ) |
| 2 | ผู้ใช้กดปุ่ม "ถามแม่หมอ" หรือ Enter | แสดง Loading Spinner ที่ปุ่ม | CTA Button (Amber-400, Pulse animation) |
| 3 | ระบบส่งคำถามไป AI Gatekeeper | แสดงสถานะ "กำลังตรวจสอบคำถาม..." | Status text (Fade-in) |
| 4 | AI ตรวจสอบผ่าน (Safe) | เปลี่ยนไปหน้า Card Selection | Transition animation |

#### Unhappy Case 1: คำถามต้องห้าม (Inappropriate Content)
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้พิมพ์คำถามเกี่ยวกับการเมือง/ความรุนแรง | แสดงข้อความในช่อง Input | Text Input |
| 2 | ผู้ใช้กดปุ่ม "ถามแม่หมอ" | แสดง Loading Spinner | CTA Button |
| 3 | AI Gatekeeper พบคำต้องห้าม | แสดง Error Message | Alert Box (Red/Pink border) |
| 4 | แสดงข้อความ "คำถามนี้ไม่เหมาะสมสำหรับการดูดวง กรุณาถามคำถามอื่นเกี่ยวกับชีวิต ความรัก หรือการงาน" | แสดงพร้อมปุ่ม "ถามใหม่" | Error message + Retry button |

#### Unhappy Case 2: คำถามสั้นเกินไป/ไม่ชัดเจน
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้พิมพ์ "???" หรือ "เทส" | แสดงข้อความในช่อง Input | Text Input |
| 2 | ผู้ใช้กดส่ง | ตรวจสอบความยาวและความหมาย | - |
| 3 | AI พบว่าคำถามไม่มีคุณภาพ | แสดง Warning Message | Warning Box (Yellow/Amber) |
| 4 | แนะนำให้ "ลองถามแบบเฉพาะเจาะจงขึ้น เช่น "ควรเปลี่ยนงานดีไหม?" | แสดงตัวอย่างคำถามที่ดี | Helper text with examples |

#### Unhappy Case 3: Spam/Repeated Questions
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้ส่งคำถามซ้ำหลายครั้ง | Rate limiter ตรวจจับ | - |
| 2 | เกิน Limit ภายใน 1 นาที | แสดง Error "กรุณารอสักครู่" | Cooldown message with timer |

### Acceptance Criteria
- [ ] ตรวจจับคำถามการเมือง ศาสนา หรือ sensitive topics ได้แม่นยำ >95%
- [ ] Response time ตรวจสอบ < 500ms
- [ ] แสดงข้อความ error ที่เป็นมิตรและมีคำแนะนำ
- [ ] รองรับภาษาไทยและอังกฤษ
- [ ] Rate limiting: 5 requests/minute/IP

### API Design

**Endpoint:** `POST /api/v1/validate-question`

**Description:** Validate user question through AI Gatekeeper

**Request Headers:**
- Content-Type: application/json
- X-Request-ID: unique-request-id

**Request Body:**
```json
{
  "question": "งานใหม่ที่ไปสัมภาษณ์จะได้ไหม?",
  "session_id": "sess_xxx",
  "language": "th"
}
```

**Response 200 (Approved):**
```json
{
  "status": "approved",
  "confidence": 0.98,
  "category": "career",
  "question_type": "yes_no",
  "suggested_spread": 1
}
```

**Response 200 (Rejected):**
```json
{
  "status": "rejected",
  "reason": "inappropriate_content",
  "message": "คำถามนี้ไม่เหมาะสมสำหรับการดูดวง",
  "suggestion": "ลองถามคำถามเกี่ยวกับชีวิต ความรัก หรือการงานแทน"
}
```

**Response 200 (Needs Clarification):**
```json
{
  "status": "clarification_needed",
  "reason": "too_short",
  "message": "คำถามสั้นเกินไป กรุณาเพิ่มรายละเอียด",
  "examples": ["ควรเปลี่ยนงานดีไหม?", "ความสัมพันธ์นี้จะราบรื่นไหม?"]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid JSON or missing required fields
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: AI service error

**Authentication:** Optional (rate limit stricter for anonymous)

### Database Schema

**Table: `question_validations`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| session_id | VARCHAR(50) | NOT NULL, INDEX | Session identifier |
| question_text | TEXT | NOT NULL | Original question |
| status | ENUM | NOT NULL | approved, rejected, clarification_needed |
| rejection_reason | VARCHAR(50) | NULL | inappropriate_content, too_short, spam |
| confidence_score | DECIMAL(3,2) | NULL | AI confidence 0.00-1.00 |
| detected_category | VARCHAR(50) | NULL | career, love, health, general |
| created_at | TIMESTAMP | DEFAULT NOW() | Validation timestamp |

**Indexes:**
- `idx_session_id` on `session_id`
- `idx_created_at` on `created_at`
- `idx_status` on `status`

**Table: `rate_limits`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| ip_address | VARCHAR(45) | NOT NULL, INDEX | User IP (IPv4/IPv6) |
| session_id | VARCHAR(50) | NULL, INDEX | Optional session |
| request_count | INTEGER | DEFAULT 0 | Count in window |
| window_start | TIMESTAMP | NOT NULL | Start of time window |
| last_request | TIMESTAMP | NOT NULL | Last request time |

**Indexes:**
- `idx_ip_window` on `ip_address`, `window_start`

### Dependencies
- **Depends on**: None (Foundation story)
- **Blocks**: US-002, US-003, US-005
- **External**: OpenAI/Claude API for content moderation

### Security Notes
- Input sanitization: Strip HTML tags, limit length to 500 chars
- Rate limiting by IP + session to prevent spam
- No PII storage in validation logs
- AI prompt injection prevention: Use system prompts to restrict AI behavior
- Log retention: 30 days for abuse analysis

---

## US-002: Intelligent Spread Selection
**Priority: 2 (HIGH - Core Feature)**  
**Status: Not Started**

**As a** tarot seeker  
**I want** the AI to analyze my question and select the right card spread  
**So that** I don't have to decide between 1-card or 3-card spread myself

### User Journey Flow
หลังจากคำถามผ่าน Gatekeeper (US-001) ผู้ใช้จะเข้าสู่หน้า Selection Phase ระบบจะวิเคราะห์คำถามและเลือกประเภทการอ่านไพ่ที่เหมาะสม (1 ใบสำหรับคำถาม Yes/No, 3 ใบสำหรับคำถามเปิด) จากนั้นแสดง Infinity Carousel ของไพ่ที่กำลังจะถูกเปิด พร้อมปุ่ม "เปิดไพ่" เมื่อผู้ใช้กดเปิดไพ่ ระบบจะส่งไปยัง AI เพื่อทำการอ่านไพ่

### Scenarios

#### Happy Path 1: Yes/No Question → 1 Card Spread
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | คำถาม "งานใหม่ที่ไปสัมภาษณ์จะได้ไหม?" ผ่าน Gatekeeper | AI วิเคราะห์คำถาม | Background process |
| 2 | ระบบตรวจพบว่าเป็น Yes/No | แสดง "แม่หมอเลือกไพ่ 1 ใบสำหรับคำถามนี้" | Banner message (Fade-in) |
| 3 | แสดง Infinity Carousel | แสดง animation ไพ่กำลังสับ | Carousel with 3D cards |
| 4 | ผู้ใช้กด "เปิดไพ่" | ไพ่หยุดที่ใบหนึ่ง พลิกหงาย | Card flip animation |
| 5 | แสดงผลไพ่และความหมาย | แสดงชื่อไพ่ + คำทำนาย | Card detail panel |

#### Happy Path 2: Open Question → 3 Card Spread (Past/Present/Future)
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | คำถาม "ควรเปลี่ยนงานดีไหม? อนาคตจะเป็นยังไง?" ผ่าน Gatekeeper | AI วิเคราะห์คำถามแบบเปิด | Background process |
| 2 | ระบบเลือก 3 ใบ | แสดง "แม่หมอเลือกไพ่ 3 ใบ" | Banner with spread diagram |
| 3 | แสดง Infinity Carousel | Animation ไพ่สับ | Carousel |
| 4 | ผู้ใช้กด "เปิดไพ่" | เปิดไพ่ทีละใบ จากซ้ายไปขวา | Sequential card flip |
| 5 | แสดงไพ่ทั้ง 3 ใบ | อธิบาย Past → Present → Future | 3-column layout |

#### Happy Path 3: Complex Question → Celtic Cross (Future)
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | คำถามซับซ้อนเกี่ยวกับชีวิตโดยรวม | AI วิเคราะห์ความซับซ้อน | Premium feature check |
| 2 | ระบบเลือก 10 ใบ (Celtic Cross) | แสดง preview แผนผังไพ่ | Spread diagram overlay |

#### Unhappy Case 1: AI Uncertain About Question Type
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | คำถามคลุมเครือ "บอกหน่อย" | AI confidence ต่ำ | - |
| 2 | ระบบแสดงตัวเลือกให้ผู้ใช้ | แสดงปุ่มเลือก: "1 ใบ - คำตอบตรงๆ" หรือ "3 ใบ - มุมมองลึก" | Selection dialog |
| 3 | ผู้ใช้เลือก | ระบบดำเนินการตามที่เลือก | Continue to carousel |

#### Unhappy Case 2: Network Error During Card Draw
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้กด "เปิดไพ่" | ส่ง request ไป server | Loading spinner on button |
| 2 | Network timeout | แสดง error "กรุณาลองใหม่" | Retry button |
| 3 | ผู้ใช้กด Retry | ส่ง request ใหม่ | - |

### Acceptance Criteria
- [ ] AI วิเคราะห์คำถามและเลือก spread ได้ถูกต้อง >90%
- [ ] รองรับ 1-card และ 3-card spreads
- [ ] Infinity Carousel animation ลื่นไหล 60fps
- [ ] Card flip animation สมจริง
- [ ] แสดง loading state ระหว่างรอ AI

### API Design

**Endpoint:** `POST /api/v1/analyze-question`

**Description:** Analyze question and determine appropriate spread

**Request:**
```json
{
  "question": "งานใหม่ที่ไปสัมภาษณ์จะได้ไหม?",
  "session_id": "sess_xxx",
  "validated": true
}
```

**Response 200:**
```json
{
  "spread_type": "single",
  "card_count": 1,
  "positions": ["answer"],
  "confidence": 0.92,
  "category": "career",
  "suggested_follow_up": [
    "ถ้าได้งาน ควรรับไหม?",
    "อะไรที่ควรระวังในงานใหม่?"
  ]
}
```

**Spread Types:**
- `single`: 1 card (Yes/No)
- "three_ppf": 3 cards (Past/Present/Future)
- "three_mpc": 3 cards (Mind/Body/Spirit)
- "celtic_cross": 10 cards (Premium)

**Endpoint:** `POST /api/v1/draw-cards`

**Request:**
```json
{
  "session_id": "sess_xxx",
  "spread_type": "three_ppf",
  "card_count": 3
}
```

**Response 200:**
```json
{
  "cards": [
    {
      "position": 0,
      "position_name": "Past",
      "card_id": "the_fool",
      "card_name": "The Fool",
      "card_name_th": "เดอะฟูล",
      "orientation": "upright",
      "image_url": "/cards/the_fool.png"
    }
  ],
  "reading_id": "read_xxx"
}
```

### Database Schema

**Table: `spreads`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| name | VARCHAR(50) | NOT NULL | Spread identifier |
| name_th | VARCHAR(100) | NOT NULL | Thai name |
| card_count | INTEGER | NOT NULL | Number of cards |
| description | TEXT | NULL | Description |
| positions | JSON | NOT NULL | Array of position names |
| is_premium | BOOLEAN | DEFAULT false | Premium feature flag |

**Table: `card_draws`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| session_id | VARCHAR(50) | NOT NULL, INDEX | Session identifier |
| reading_id | VARCHAR(50) | NOT NULL, INDEX | Reading group |
| spread_type | VARCHAR(50) | NOT NULL | Reference to spreads |
| card_id | VARCHAR(50) | NOT NULL | Tarot card identifier |
| position | INTEGER | NOT NULL | Position in spread |
| orientation | ENUM | NOT NULL | upright, reversed |
| drawn_at | TIMESTAMP | DEFAULT NOW() | Draw timestamp |

**Indexes:**
- `idx_session_reading` on `session_id`, `reading_id`
- `idx_drawn_at` on `drawn_at`

### Dependencies
- **Depends on**: US-001 (validated question)
- **Blocks**: US-003, US-005
- **External**: None

### Security Notes
- Card randomization using cryptographically secure RNG
- Session-based draw history to prevent manipulation
- Rate limit card draws per session

---

## US-003: Engagement Loop - Follow-up Questions
**Priority: 3 (MEDIUM - Retention Feature)**  
**Status: Not Started**

**As a** tarot seeker  
**I want** to ask follow-up questions after my reading  
**So that** I can explore my situation more deeply without starting over

### User Journey Flow
หลังจากได้รับการอ่านไพ่ (US-002) ผู้ใช้จะเห็นหน้า Reading Result พร้อมตัวเลือก:
1. ถามคำถามต่อเนื่อง (Follow-up) - กลับไป Gatekeeper พร้อม context
2. จบ Session และดูสรุป (US-005)

หากเลือกถามต่อ ระบบจะนำผู้ใช้กลับไปหน้า Input แต่จะแสดงประวัติการอ่านไพ่ก่อนหน้า และให้ AI วิเคราะห์คำถามต่อเนื่องโดยคำนึงถึงบริบทที่ผ่านมา

### Scenarios

#### Happy Path: Ask Follow-up Question
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้อ่านผลไพ่เสร็จ | แสดงตัวเลือก 3 ปุ่ม | Action buttons row |
| 2 | ผู้ใช้กด "ถามต่อ" | แสดงหน้า Input พร้อม history | Chat-like interface |
| 3 | แสดงการ์ดสรุปไพ่ก่อนหน้า | โชว์ไพ่ที่เพิ่งอ่านไป | Mini card preview |
| 4 | ผู้ใช้พิมพ์คำถามต่อ "แล้วถ้าได้งาน เงินเดือนจะดีขึ้นไหม?" | แสดงในช่อง chat | Text input with context |
| 5 | กดส่ง | ผ่าน Gatekeeper (context-aware) | Loading state |
| 6 | AI วิเคราะห์พร้อมบริบท | เลือก spread ใหม่ | - |
| 7 | เปิดไพ่ใบใหม่ | แสดงผลพร้อมเชื่อมโยงกับไพ่ก่อน | Connected reading view |

#### Happy Path: Follow-up with Same Card (Redraw)
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้กด "ขอเปิดใหม่" (Redraw) | แสดง confirmation dialog | Modal dialog |
| 2 | ยืนยัน | สับไพ่ใหม่จากสำรับเดิม | Carousel animation |
| 3 | เปิดไพ่ใบใหม่ | แสดงผล + เปรียบเทียบกับใบเดิม | Side-by-side cards |

#### Unhappy Case 1: Follow-up Limit Reached
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้ถามต่อครบ 3 ครั้ง (Free tier) | แสดงข้อความ "ครบจำนวนคำถามฟรี" | Upgrade prompt |
| 2 | แสดงตัวเลือก Upgrade | ปุ่ม "ดูแผนที่เหลือ" / "จบการดู" | CTA buttons |

#### Unhappy Case 2: Context Lost (Session Expired)
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้กลับมาถามต่อหลังจาก 30 นาที | Session expired | Warning banner |
| 2 | แสดงข้อความ "เริ่มต้นใหม่?" | ปุ่ม "ดูประวัติ" หรือ "เริ่มใหม่" | Recovery options |

### Acceptance Criteria
- [ ] รองรับ follow-up ได้ 3 ครั้งต่อ session (free tier)
- [ ] AI เข้าใจบริบทจากคำถามและไพ่ก่อนหน้า
- [ ] แสดงประวัติการอ่านไพ่ในรูปแบบ timeline
- [ ] รองรับ Redraw ได้ไม่จำกัด (สำหรับโหมดเล่น)

### API Design

**Endpoint:** `POST /api/v1/follow-up`

**Request:**
```json
{
  "session_id": "sess_xxx",
  "question": "แล้วถ้าได้งาน เงินเดือนจะดีขึ้นไหม?",
  "previous_reading_id": "read_xxx",
  "follow_up_count": 1
}
```

**Response 200:**
```json
{
  "allowed": true,
  "remaining_follow_ups": 2,
  "context_summary": "User drew The Fool (Past), The Magician (Present), Ten of Pentacles (Future) regarding job change",
  "suggested_spread": "single",
  "estimated_tokens": 150
}
```

**Endpoint:** `GET /api/v1/session/{session_id}/history`

**Response 200:**
```json
{
  "session_id": "sess_xxx",
  "started_at": "2026-02-28T10:00:00Z",
  "interactions": [
    {
      "type": "initial",
      "question": "ควรเปลี่ยนงานดีไหม?",
      "reading_id": "read_001",
      "cards_drawn": 3,
      "timestamp": "2026-02-28T10:05:00Z"
    },
    {
      "type": "follow_up",
      "question": "แล้วถ้าได้งาน เงินเดือนจะดีขึ้นไหม?",
      "reading_id": "read_002",
      "cards_drawn": 1,
      "timestamp": "2026-02-28T10:15:00Z"
    }
  ]
}
```

### Database Schema

**Table: `sessions`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | VARCHAR(50) | PK | Session identifier |
| ip_address | VARCHAR(45) | NOT NULL | User IP |
| user_agent | TEXT | NULL | Browser info |
| started_at | TIMESTAMP | DEFAULT NOW() | Session start |
| last_activity | TIMESTAMP | DEFAULT NOW() | Last activity |
| follow_up_count | INTEGER | DEFAULT 0 | Number of follow-ups |
| status | ENUM | DEFAULT active | active, completed, expired |

**Indexes:**
- `idx_last_activity` on `last_activity`
- `idx_status` on `status`

**Table: `interactions`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| session_id | VARCHAR(50) | NOT NULL, FK | Reference to sessions |
| interaction_type | ENUM | NOT NULL | initial, follow_up |
| question | TEXT | NOT NULL | User question |
| reading_id | VARCHAR(50) | NOT NULL | Reference to reading |
| sequence_number | INTEGER | NOT NULL | Order in session |
| created_at | TIMESTAMP | DEFAULT NOW() | Timestamp |

**Indexes:**
- `idx_session_seq` on `session_id`, `sequence_number`

### Dependencies
- **Depends on**: US-001, US-002
- **Blocks**: US-005
- **External**: None

### Security Notes
- Session timeout: 30 minutes
- Max follow-ups per session: 3 (configurable)
- Context summarization to reduce token usage
- No storage of personal data in session history

---

## US-004: Scalability & Monetization
**Priority: 4 (LOW - Architecture Track)**  
**Status: Not Started**

**As a** business owner  
**I want** the system designed for future growth and revenue  
**So that** we can scale users and implement monetization models

### User Journey Flow
(Non-functional requirement - applies across all user journeys)

### Key Requirements

#### Scalability
- Stateless API design for horizontal scaling
- Database read replicas for query-heavy operations
- Redis caching for card data and spreads
- CDN for static assets (card images)
- Async processing for AI requests (queue-based)

#### Monetization Features
| Tier | Features | Limit |
|------|----------|-------|
| Free | 1 question/day, 1-card spread only | 1 question |
| Basic (฿49/mo) | 10 questions/day, 3-card spread | 10 questions |
| Premium (฿149/mo) | Unlimited, all spreads, save history | Unlimited |
| Pay-per-use | ฿15 per question | No subscription |

### API Design

**Endpoint:** `GET /api/v1/pricing`

**Response 200:**
```json
{
  "tiers": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": ["1 question/day", "1-card spread"],
      "limits": {"questions_per_day": 1}
    },
    {
      "id": "basic",
      "name": "Basic",
      "price": 49,
      "currency": "THB",
      "features": ["10 questions/day", "3-card spread"],
      "limits": {"questions_per_day": 10}
    }
  ]
}
```

### Database Schema

**Table: `users`** (Future)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| email | VARCHAR(255) | UNIQUE | User email |
| tier | VARCHAR(20) | DEFAULT free | Subscription tier |
| tier_expires_at | TIMESTAMP | NULL | Subscription end |
| daily_questions_used | INTEGER | DEFAULT 0 | Today's count |
| last_reset_at | TIMESTAMP | NULL | Daily reset time |

### Dependencies
- **Depends on**: None (architecture layer)
- **Blocks**: None
- **External**: Payment gateway (Stripe, Omise)

### Security Notes
- API rate limiting by tier
- Secure payment processing (PCI compliance)
- User data encryption at rest

---

## US-005: Final Output Value - Session Summary
**Priority: 5 (MEDIUM - End Value)**  
**Status: Not Started**

**As a** tarot seeker  
**I want** to receive a complete summary of my session  
**So that** I can save or share my tarot reading results

### User Journey Flow
เมื่อผู้ใช้เลือก "จบ Session" หรือถามครบจำนวนครั้งที่กำหนด ระบบจะสร้าง Final Summary ที่รวบรวม:
- คำถามทั้งหมดที่ถาม
- ไพ่ที่เปิดได้แต่ละครั้ง
- คำทำนายรวม
- คำแนะนำสรุปจากแม่หมอ AI

ผู้ใช้สามารถ:
1. ดูสรุปแบบสวยงาม (Visual Summary)
2. ดาวน์โหลดเป็นรูปภาพ
3. แชร์ไป Social Media
4. บันทึกไว้ดูย้อนหลัง (สำหรับ logged-in users)

### Scenarios

#### Happy Path: Generate and View Summary
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้กด "จบการดู" | แสดง loading "กำลังสรุปผล..." | Full-screen loader |
| 2 | AI สรุปบทสนทนา | Generate visual summary | Background process |
| 3 | แสดง Summary Page | โชว์การ์ดสวยงามพร้อมไพ่ทั้งหมด | Full-page layout |
| 4 | ผู้ใช้เลื่อนดู | Smooth scroll ผ่าน timeline | Scroll animations |
| 5 | แสดงปุ่ม actions | Share, Download, Save | Sticky bottom bar |

#### Happy Path: Share to Social Media
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้กด "แชร์" | เปิด Share sheet/modal | Share dialog |
| 2 | เลือก platform (FB, IG, Line, Copy link) | Generate shareable image | Platform icons |
| 3 | แสดง preview รูปที่จะแชร์ | Card collage with branding | Image preview |
| 4 | ยืนยัน | Open native share หรือ download | - |

#### Unhappy Case 1: Summary Generation Fails
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้กด "จบการดู" | AI generation timeout | Error state |
| 2 | แสดง error | "ไม่สามารถสรุปได้" | Retry button |
| 3 | ผู้ใช้กด Retry | ลอง generate ใหม่ | - |

#### Unhappy Case 2: Anonymous User Wants to Save
| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้กด "บันทึกไว้ดูย้อนหลัง" | ตรวจสอบ login status | - |
| 2 | ยังไม่ login | แสดง "กรุณาเข้าสู่ระบบ" | Login prompt |
| 3 | ผู้ใช้เลือก "สมัครสมาชิก" | Redirect to signup | - |

### Acceptance Criteria
- [ ] สรุป session ได้ภายใน 5 วินาที
- [ ] รองรับ export เป็น PNG/JPG
- [ ] รูปแบบสวยงาม พร้อม branding
- [ ] รองรับการแชร์ผ่าน Web Share API
- [ ] เก็บประวัติย้อนหลัง 30 วัน (สำหรับ logged-in users)

### API Design

**Endpoint:** `POST /api/v1/sessions/{session_id}/summary`

**Request:**
```json
{
  "include_cards": true,
  "include_insights": true,
  "format": "json"
}
```

**Response 200:**
```json
{
  "session_id": "sess_xxx",
  "summary_text": "จากการดูดวงวันนี้ คุณได้รับคำแนะนำเกี่ยวกับการงาน...",
  "total_cards_drawn": 4,
  "interactions": [
    {
      "question": "ควรเปลี่ยนงานดีไหม?",
      "cards": [{"name": "The Fool", "meaning": "เริ่มต้นใหม่"}],
      "key_insight": "เป็นโอกาสดีสำหรับการเปลี่ยนแปลง"
    }
  ],
  "overall_theme": "การเปลี่ยนแปลงและโอกาสใหม่",
  "shareable_image_url": "/share/sess_xxx.png",
  "expires_at": "2026-03-30T00:00:00Z"
}
```

**Endpoint:** `GET /api/v1/sessions/{session_id}/summary.png`

**Response:** PNG image (generated on-the-fly or cached)

### Database Schema

**Table: `summaries`**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| session_id | VARCHAR(50) | NOT NULL, UNIQUE | Session reference |
| summary_text | TEXT | NOT NULL | AI-generated summary |
| overall_theme | VARCHAR(100) | NULL | Theme extracted |
| card_count | INTEGER | NOT NULL | Total cards |
| image_url | VARCHAR(255) | NULL | Generated image path |
| expires_at | TIMESTAMP | NOT NULL | Auto-delete date |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_session` on `session_id`
- `idx_expires` on `expires_at`

### Dependencies
- **Depends on**: US-001, US-002, US-003
- **Blocks**: None
- **External**: Image generation service (Canvas/Sharp/Puppeteer)

### Security Notes
- Summary images contain no PII
- Public share URLs use obfuscated IDs
- Auto-expire shared content after 30 days

---

## Summary: Priority & Dependencies

| Priority | User Story | Depends On | Blocks | Est. Effort |
|----------|-----------|------------|--------|-------------|
| 1 | US-001 AI Gatekeeper | - | US-002, US-003, US-005 | 3 days |
| 2 | US-002 Intelligent Spread | US-001 | US-003, US-005 | 5 days |
| 3 | US-003 Engagement Loop | US-001, US-002 | US-005 | 4 days |
| 4 | US-005 Final Output | US-001, US-002, US-003 | - | 4 days |
| - | US-004 Scalability | - | - | Parallel track |

**Recommended Sprint Order:**
- **Sprint 1**: US-001 + US-002 (Core experience)
- **Sprint 2**: US-003 (Engagement)
- **Sprint 3**: US-005 (End value) + Polish
- **Ongoing**: US-004 (Infrastructure)
