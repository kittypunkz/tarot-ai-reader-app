# 📋 User Stories Master Index

**All features, prioritized and tracked in one place**

---

## 🎯 Legend

| Status | Icon | Meaning |
|--------|------|---------|
| Done | ✅ | Complete and deployed |
| In Progress | 🚧 | Currently being built |
| Planned | 📅 | Scheduled for next sprint |
| Draft | 📝 | Being defined |
| Backlog | 📦 | Future consideration |

| Priority | Meaning |
|----------|---------|
| P0 | Critical - Blocker |
| P1 | High - Must have |
| P2 | Medium - Should have |
| P3 | Low - Nice to have |

---

## 📊 Epic Overview

| Epic | Description | Progress | Stories |
|------|-------------|----------|---------|
| **Core Experience** | Basic tarot reading flow | 2/3 ✅ | 3 |
| **User Engagement** | Follow-ups, history, accounts | 0/3 📝 | 3 |
| **Monetization** | Payments, tiers, limits | 0/3 📦 | 3 |
| **Platform** | Infrastructure, performance | 2/4 ✅ | 4 |

---

## 🎴 Epic 1: Core Experience

### US-001: AI Gatekeeper ✅
**Status:** Done | **Priority:** P0 | **Sprint:** 1

**As a** tarot seeker  
**I want** my questions filtered for appropriateness  
**So that** I have a safe and meaningful experience

**Key Features:**
- Content filtering (AI + rules)
- Rate limiting (5 req/min)
- Thai/English support
- Smart rejection messages

**[Full Details →](./user-stories/US-001-gatekeeper.md)**

---

### US-002: Intelligent Spread Selection ✅
**Status:** Done | **Priority:** P0 | **Sprint:** 1

**As a** tarot seeker  
**I want** the system to choose the right spread for my question  
**So that** I get the most relevant reading

**Key Features:**
- AI analyzes question type
- Auto-selects 1-card or 3-card spread
- Card drawing with animation
- 22 Major Arcana support

**[Full Details →](./user-stories/US-002-spread-selection.md)**

---

### US-002-ENHANCE: Interactive Card Carousel ✅
**Status:** Done | **Priority:** P1 | **Sprint:** 2

**As a** tarot seeker  
**I want** to browse and manually select cards with visual feedback  
**So that** I feel more connected to the selection process

**Key Features:**
- Drag/swipe through 78 cards
- Visual selection with ⭐ badge
- Selection panel at bottom
- Progress indicator "X/Y selected"
- Can remove and reselect

**[Full Details →](./user-stories/US-002-ENHANCE-carousel.md)**

---

## 🔄 Epic 2: User Engagement

### US-003: Follow-up Questions 🚧
**Status:** In Progress | **Priority:** P1 | **Sprint:** 3

**As a** tarot seeker  
**I want** to ask follow-up questions about my reading  
**So that** I can dive deeper into the guidance

**Key Features:**
- Context-aware responses
- Session continuity
- Up to 3 follow-ups per reading

**[Full Details →](./user-stories/US-003-followup.md)** *(Draft)*

---

### US-004: Session History 📦
**Status:** Backlog | **Priority:** P2 | **Sprint:** TBD

**As a** returning user  
**I want** to see my past readings  
**So that** I can track patterns and growth

**Key Features:**
- Browse past readings
- Search by date/question
- Re-read interpretations

**[Full Details →](./user-stories/US-004-history.md)** *(Draft)*

---

### US-005: User Accounts 📦
**Status:** Backlog | **Priority:** P2 | **Sprint:** TBD

**As a** regular user  
**I want** to create an account  
**So that** my history persists across devices

**Key Features:**
- Email/password login
- Google OAuth
- Profile management

**[Full Details →](./user-stories/US-005-accounts.md)** *(Draft)*

---

## 💰 Epic 3: Monetization

### US-006: Tiered Pricing 📦
**Status:** Backlog | **Priority:** P2 | **Sprint:** TBD

**As a** business owner  
**I want** to offer free and premium tiers  
**So that** I can monetize the app

**Key Features:**
- Free tier: 3 readings/day
- Premium tier: Unlimited
- Premium features: Celtic Cross spread

**[Full Details →](./user-stories/US-006-pricing.md)** *(Draft)*

---

### US-007: Payment Integration 📦
**Status:** Backlog | **Priority:** P3 | **Sprint:** TBD

**As a** user  
**I want** to pay for premium features  
**So that** I can unlock unlimited readings

**Key Features:**
- Stripe/PromptPay integration
- Subscription management
- Receipts/invoices

**[Full Details →](./user-stories/US-007-payments.md)** *(Draft)*

---

## ⚙️ Epic 4: Platform & Infrastructure

### US-008: Production Deployment ✅
**Status:** Done | **Priority:** P0 | **Sprint:** 1

**As a** developer  
**I want** automated CI/CD deployment  
**So that** updates go live automatically

**Key Features:**
- GitHub Actions workflows
- Render/Vercel deployment
- Database migrations

**[Full Details →](./user-stories/US-008-deployment.md)**

---

### US-009: Local Development Setup ✅
**Status:** Done | **Priority:** P0 | **Sprint:** 1

**As a** developer  
**I want** easy local development setup  
**So that** I can work efficiently

**Key Features:**
- Docker Compose for PostgreSQL
- SQLite fallback
- One-click start scripts

**[Full Details →](./user-stories/US-009-local-dev.md)**

---

### US-010: Analytics & Monitoring 📦
**Status:** Backlog | **Priority:** P3 | **Sprint:** TBD

**As a** product owner  
**I want** to track user behavior  
**So that** I can improve the product

**Key Features:**
- Page view tracking
- Reading completion rates
- Error monitoring (Sentry)

**[Full Details →](./user-stories/US-010-analytics.md)** *(Draft)*

---

## 📅 Sprint Planning

### Sprint 1 (Complete) ✅
- US-001: AI Gatekeeper
- US-002: Spread Selection  
- US-008: Deployment Setup
- US-009: Local Dev Setup

### Sprint 2 (Complete) ✅
- US-002-ENHANCE: Interactive Carousel
- Bug fixes & polish

### Sprint 3 (Current) 🚧
- US-003: Follow-up Questions (backend APIs done, frontend pending)
- US-010: Analytics (partial)

### Backlog 📦
- US-004: Session History
- US-005: User Accounts
- US-006: Tiered Pricing
- US-007: Payments

---

## 🆕 Adding New User Stories

1. Copy template: `user-stories/TEMPLATE.md`
2. Create: `user-stories/US-XXX-feature-name.md`
3. Add entry above in appropriate epic
4. Update status/priority in this file
5. Update [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md)

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total Stories | 10 |
| Done | 4 |
| In Progress | 1 |
| Planned | 1 |
| Draft/Backlog | 4 |
| **Completion** | **50%** |

---

Last updated: 2026-03-08  
Next review: 2026-03-15
