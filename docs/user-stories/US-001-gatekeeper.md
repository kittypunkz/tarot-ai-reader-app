# US-001: AI Gatekeeper - Content Filtering

**Epic:** Core Experience  
**Priority:** P0 (HIGHEST - Foundation)  
**Status:** ✅ Done  
**Sprint:** 1  
**Owner:** Development Team  

---

## 📝 User Story

**As a** system administrator  
**I want** to filter inappropriate questions before processing  
**So that** we reduce AI costs and maintain quality user experience

---

## 🎬 User Journey Flow

ผู้ใช้เปิดแอปและพบหน้า Input Screen ที่มีช่องให้กรอกคำถาม เมื่อผู้ใช้พิมพ์คำถามและกดปุ่ม "ถามแม่หมอ" ระบบจะส่งคำถามไปตรวจสอบที่ AI Gatekeeper ก่อน หากคำถามผ่านการตรวจสอบ จะเข้าสู่ขั้นตอนการเลือกไพ่ (US-002) หากไม่ผ่าน ระบบจะแสดงข้อความแจ้งเตือนพร้อมคำแนะนำให้ปรับคำถาม

---

## 🎭 Scenarios

### ✅ Happy Path: คำถามผ่านการตรวจสอบ

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้พิมพ์คำถาม "งานใหม่ที่ไปสัมภาษณ์จะได้ไหม?" | แสดงข้อความในช่อง Input | Text Input (ขนาดใหญ่, กลางจอ) |
| 2 | ผู้ใช้กดปุ่ม "ถามแม่หมอ" หรือ Enter | แสดง Loading Spinner ที่ปุ่ม | CTA Button (Amber-400, Pulse animation) |
| 3 | ระบบส่งคำถามไป AI Gatekeeper | แสดงสถานะ "กำลังตรวจสอบคำถาม..." | Status text (Fade-in) |
| 4 | AI ตรวจสอบผ่าน (Safe) | เปลี่ยนไปหน้า Card Selection | Transition animation |

### ❌ Unhappy Case 1: คำถามต้องห้าม (Inappropriate Content)

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้พิมพ์คำถามเกี่ยวกับการเมือง/ความรุนแรง | แสดงข้อความในช่อง Input | Text Input |
| 2 | ผู้ใช้กดปุ่ม "ถามแม่หมอ" | แสดง Loading Spinner | CTA Button |
| 3 | AI Gatekeeper พบคำต้องห้าม | แสดง Error Message | Alert Box (Red/Pink border) |
| 4 | แสดงข้อความ "คำถามนี้ไม่เหมาะสมสำหรับการดูดวง กรุณาถามคำถามอื่นเกี่ยวกับชีวิต ความรัก หรือการงาน" | แสดงพร้อมปุ่ม "ถามใหม่" | Error message + Retry button |

### ⚠️ Unhappy Case 2: คำถามสั้นเกินไป/ไม่ชัดเจน

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้พิมพ์ "???" หรือ "เทส" | แสดงข้อความในช่อง Input | Text Input |
| 2 | ผู้ใช้กดส่ง | ตรวจสอบความยาวและความหมาย | - |
| 3 | AI พบว่าคำถามไม่มีคุณภาพ | แสดง Warning Message | Warning Box (Yellow/Amber) |
| 4 | แนะนำให้ "ลองถามแบบเฉพาะเจาะจงขึ้น เช่น 'ควรเปลี่ยนงานดีไหม?'" | แสดงตัวอย่างคำถามที่ดี | Helper text with examples |

### ⏱️ Unhappy Case 3: Spam/Repeated Questions

| Step | User Action | System Response | UI Element |
|------|-------------|-----------------|------------|
| 1 | ผู้ใช้ส่งคำถามซ้ำหลายครั้ง | Rate limiter ตรวจจับ | - |
| 2 | เกิน Limit ภายใน 1 นาที | แสดง Error "กรุณารอสักครู่" | Cooldown message with timer |

---

## ✅ Acceptance Criteria

- [x] ตรวจจับคำถามการเมือง ศาสนา หรือ sensitive topics ได้แม่นยำ >95%
- [x] Response time ตรวจสอบ < 500ms
- [x] แสดงข้อความ error ที่เป็นมิตรและมีคำแนะนำ
- [x] รองรับภาษาไทยและอังกฤษ
- [x] Rate limiting: 5 requests/minute/IP

---

## 🔌 API Design

### Endpoint: `POST /api/v1/validate-question`

**Description:** Validate user question through AI Gatekeeper

#### Request Headers
- Content-Type: application/json
- X-Request-ID: unique-request-id

#### Request Body
```json
{
  "question": "งานใหม่ที่ไปสัมภาษณ์จะได้ไหม?",
  "session_id": "sess_xxx",
  "language": "th"
}
```

#### Response 200 (Approved)
```json
{
  "status": "approved",
  "confidence": 0.98,
  "category": "career",
  "question_type": "yes_no",
  "suggested_spread": 1
}
```

#### Response 200 (Rejected)
```json
{
  "status": "rejected",
  "reason": "inappropriate_content",
  "message": "คำถามนี้ไม่เหมาะสมสำหรับการดูดวง",
  "suggestion": "ลองถามคำถามเกี่ยวกับชีวิต ความรัก หรือการงานแทน"
}
```

#### Response 200 (Needs Clarification)
```json
{
  "status": "clarification_needed",
  "reason": "too_short",
  "message": "คำถามสั้นเกินไป กรุณาเพิ่มรายละเอียด",
  "examples": ["ควรเปลี่ยนงานดีไหม?", "ความสัมพันธ์นี้จะราบรื่นไหม?"]
}
```

#### Error Responses
- `400 Bad Request`: Invalid JSON or missing required fields
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: AI service error

**Authentication:** Optional (rate limit stricter for anonymous)

---

## 🗄️ Database Schema

### Table: `question_validations`

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

### Table: `rate_limits`

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

---

## 🔗 Dependencies

- **Depends on:** None (Foundation story)
- **Blocks:** US-002, US-003, US-005
- **External:** OpenRouter API for content moderation

---

## 🔒 Security Notes

- Input sanitization: Strip HTML tags, limit length to 500 chars
- Rate limiting by IP + session to prevent spam
- No PII storage in validation logs
- AI prompt injection prevention: Use system prompts to restrict AI behavior
- Log retention: 30 days for abuse analysis

---

## 📝 Implementation Notes

**Completed:** 2026-02-28

**Key Implementation Details:**
- Used OpenRouter API with free Google Gemma model
- Implemented hybrid approach: Rule-based pre-filter + AI validation
- Rate limiting with sliding window
- Thai language optimized prompts

**Files Modified:**
- `backend/src/services/gatekeeper.py`
- `backend/src/services/rate_limiter.py`
- `frontend/app/page.tsx` (input screen)
