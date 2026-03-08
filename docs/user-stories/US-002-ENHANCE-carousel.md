# User Story: Enhanced Interactive Card Carousel

## Story ID: US-002-ENHANCE
**Epic:** Intelligent Spread Selection  
**Priority:** High  
**Status:** Draft  

---

## 🎯 User Story

**As a** tarot seeker  
**I want to** browse through all 78 cards by dragging/swiping and manually select cards with visual feedback  
**So that** I feel more connected to the selection process and have agency in choosing my destiny

---

## 😫 Current Pain Points

### Problem 1: Passive Experience
- Current flow: Cards auto-rotate in infinity carousel
- User just clicks "stop" and gets random cards
- **No feeling of personal connection** to selected cards

### Problem 2: Lack of Control
- User cannot browse all cards freely
- Cannot see card details before selection
- **Anxiety**: "What if I missed the perfect card?"

### Problem 3: No Visual Feedback
- Selected cards disappear or don't show selected state
- User doesn't know which cards they've picked
- **Confusion**: "Did I already select 2 or 3 cards?"

---

## ✨ Enhanced User Journey Flow

### Phase 1: Question Input (Existing)
```
┌─────────────────────────────────────┐
│  User types question               │
│  → Passes AI Gatekeeper            │
│  → System suggests spread type     │
└─────────────┬───────────────────────┘
              │
              ▼
```

### Phase 2: Card Discovery (NEW - Enhanced)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  "เลือกไพ่ที่คุณรู้สึกถึง" / "Select cards that call to you"  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │    ◀────  [78 Cards Carousel]  ────▶              │   │
│  │                                                     │   │
│  │  🖱️ Drag mouse or 👆 Swipe finger to browse       │   │
│  │                                                     │   │
│  │     Card backs showing (mystical design)          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  ⭐      │ │          │ │          │  ← Selected slots  │
│  │ Card 1   │ │ Card 2   │ │ Card 3   │    (0/3 selected)  │
│  │ [The     │ │ [Locked] │ │ [Locked] │                    │
│  │  Fool]   │ │          │ │          │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
│              [  ดำเนินการต่อ  →  ]                          │
│              (Continue - disabled until full)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Interactive Selection (NEW)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User browses carousel by dragging:                        │
│                                                             │
│  1. 👆 Touch & drag left/right to scroll                   │
│  2. 🖱️ Mouse click & drag to scroll                        │
│  3. Cards have inertia/momentum (smooth physics)           │
│  4. Infinite loop: Card 78 → Card 1 seamless               │
│                                                             │
│  When user finds a card they like:                         │
│  → Tap/Click on card back                                  │
│  → Card flips to show front briefly (500ms)                │
│  → Card slides to selection slot                           │
│  → Card in carousel gets "selected" overlay (⭐ badge)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 4: Selection Complete
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  When all cards selected:                                  │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  ⭐      │ │  ⭐      │ │  ⭐      │                    │
│  │ The Fool │ │ The Magician│ │ High Priestess│              │
│  │ [正位]   │ │ [逆位]   │ │ [正位]   │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
│  [  🔮 ดูผลลัพธ์  ]  ← Button now ACTIVE                    │
│  (Reveal Reading)                                           │
│                                                             │
│  [↺ เลือกใหม่]  ← Optional: Reset and re-select            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Detailed UI Specifications

### 1. Carousel Behavior

#### Drag Physics
```typescript
interface CarouselPhysics {
  // Touch/Mouse drag
  dragSensitivity: 1.5;           // Multiplier for drag distance
  momentumDecay: 0.95;            // Friction (0-1)
  minVelocity: 0.5;               // Stop threshold
  snapToCard: true;               // Auto-align to nearest card
  snapDuration: 300;              // ms
  
  // Visual effects
  perspective: 1000;              // 3D perspective px
  rotationY: 15;                  // Degrees when dragging
  scaleActive: 1.1;               // Scale of center card
}
```

#### Card States in Carousel
```typescript
type CardState = 
  | 'idle'           // Normal state
  | 'hover'          // Mouse over (slight lift)
  | 'dragging'       // Currently being dragged
  | 'selected'       // Picked by user (⭐ badge)
  | 'disabled';      // Already picked (dimmed)

interface CardVisualState {
  idle: {
    scale: 1,
    y: 0,
    brightness: 1,
    shadow: 'none'
  },
  hover: {
    scale: 1.05,
    y: -10,
    brightness: 1.1,
    shadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
  selected: {
    scale: 0.95,
    y: 0,
    brightness: 0.7,
    overlay: 'selected-badge.png',
    shadow: '0 0 20px rgba(255,215,0,0.5)'  // Gold glow
  }
}
```

### 2. Selection Slots (Bottom Panel)

```
┌────────────────────────────────────────────────────────────┐
│  Selection Progress                                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                                                      │ │
│  │  [Card 1]      [Card 2]      [Card 3]               │ │
│  │                                                      │ │
│  │  ┌──────┐    ┌──────┐    ┌──────┐                  │ │
│  │  │ 🌟   │    │      │    │      │                  │ │
│  │  │THE   │    │  ?   │    │  ?   │                  │ │
│  │  │FOOL │    │ LOCK │    │ LOCK │                  │ │
│  │  │正位  │    │      │    │      │                  │ │
│  │  └──────┘    └──────┘    └──────┘                  │ │
│  │                                                      │ │
│  │  [x] Remove  [Locked]  [Locked]     1/3 selected    │ │
│  │                                                      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Slot Features:**
- Shows selected card face-up immediately
- Displays position (upright/reversed)
- Card name in Thai and English
- Remove button (x) to deselect
- Locked slots show "?" placeholder
- Progress indicator: "1/3 selected"

### 3. Card Flip Animation

```
User clicks card in carousel:

Frame 0-10 (300ms):   Card lifts up + scales up
Frame 11-20 (200ms):  Card flips 180° (back → front)
Frame 21-30 (200ms):  Brief reveal (show card face)
Frame 31-40 (200ms):  Card moves to selection slot
Frame 41-50 (200ms):  Slot card scales from 0 → 1
Frame 51+:            Carousel card shows "selected" state
```

---

## 🛠️ Technical Requirements

### Frontend Components

#### New Components
```typescript
// EnhancedCarousel.tsx
interface EnhancedCarouselProps {
  cards: TarotCard[];              // All 78 cards
  selectedCards: SelectedCard[];   // Currently selected
  maxSelection: number;            // 1 or 3
  onCardSelect: (cardId: string) => void;
  onCardDeselect: (cardId: string) => void;
  physics?: CarouselPhysics;
}

// SelectionSlots.tsx
interface SelectionSlotsProps {
  slots: (SelectedCard | null)[];
  maxSlots: number;
  onRemove: (index: number) => void;
}

// CardBack.tsx (mystical design)
interface CardBackProps {
  state: CardState;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: (velocity: number) => void;
}
```

#### State Management
```typescript
interface CarouselState {
  // Carousel position
  currentIndex: number;
  dragOffset: number;
  velocity: number;
  isDragging: boolean;
  
  // Selections
  selectedCards: SelectedCard[];
  animatingCard: string | null;  // Card currently animating
  
  // UI state
  showHint: boolean;             // "Drag to browse" hint
  showConfirmation: boolean;     // All cards selected modal
}
```

### Animation Library Requirements

```json
{
  "dependencies": {
    "framer-motion": "^12.x",     // Already have - for animations
    "@use-gesture/react": "^10.x", // Touch/drag gestures
    "embla-carousel-react": "^8.x" // Alternative: robust carousel
  }
}
```

### Performance Considerations

```typescript
// Virtualization for 78 cards
interface VirtualizationConfig {
  renderWindow: 7,        // Render 7 cards (center + 3 each side)
  preloadBuffer: 3,       // Preload 3 extra cards
  recycleNodes: true,     // Reuse DOM elements
  
  // Card dimensions
  cardWidth: 120,         // px
  cardGap: 20,            // px
  containerPadding: 40,   // px
}
```

---

## 🎭 User Scenarios

### Scenario 1: First-Time User
```gherkin
Given user "Mint" has never used tarot before
When she reaches the card selection screen
Then she sees a hint: "ลากเพื่อเลื่อนดูไพ่ / Drag to browse cards"
And she can freely drag to see all 78 cards
And when she taps a card, it flips and shows selection animation
And she sees her selected card appear in bottom panel
```

### Scenario 2: Power User (Quick Selection)
```gherkin
Given user "John" uses tarot regularly
When he reaches the selection screen
Then he can quickly swipe through cards
And double-tap to instantly select without flip animation
And see all 3 selected cards immediately
```

### Scenario 3: Indecisive User
```gherkin
Given user "Sarah" is undecided
When she has selected 2 cards and browses for the 3rd
Then she can see her 2 selected cards in the bottom panel
And she can remove any selected card to choose again
And the card returns to carousel in "available" state
```

### Scenario 4: Mobile User
```gherkin
Given user "Tom" is on mobile phone
When he uses the carousel
Then he can swipe with finger naturally
And the carousel responds to touch with momentum
And cards are large enough to tap accurately (min 100px)
```

---

## ✅ Acceptance Criteria

### Functional Requirements

- [ ] **AC-1**: User can drag carousel left/right with mouse
- [ ] **AC-2**: User can swipe carousel left/right with touch
- [ ] **AC-3**: Carousel has momentum/inertia physics
- [ ] **AC-4**: Cards loop infinitely (card 78 → card 1)
- [ ] **AC-5**: Tapping a card triggers selection
- [ ] **AC-6**: Selected card shows brief flip animation
- [ ] **AC-7**: Selected card appears in bottom panel
- [ ] **AC-8**: Card in carousel shows "selected" state (⭐ badge)
- [ ] **AC-9**: User can remove selected card from panel
- [ ] **AC-10**: Removed card returns to carousel as available
- [ ] **AC-11**: Progress shows "X/Y selected" count
- [ ] **AC-12**: Continue button disabled until selection complete
- [ ] **AC-13**: Works on desktop (mouse) and mobile (touch)

### UI/UX Requirements

- [ ] **AC-14**: Card flip animation < 1 second
- [ ] **AC-15**: Carousel drag feels smooth (60fps)
- [ ] **AC-16**: Selected cards clearly visible in panel
- [ ] **AC-17**: Hint/tooltip for first-time users
- [ ] **AC-18**: Responsive design (mobile/tablet/desktop)
- [ ] **AC-19**: Accessible (keyboard navigation, ARIA labels)

### Performance Requirements

- [ ] **AC-20**: Initial load < 2 seconds
- [ ] **AC-21**: Smooth 60fps during drag
- [ ] **AC-22**: Max 7 cards rendered at once (virtualization)
- [ ] **AC-23**: Works on low-end devices

---

## 🚦 State Machine

```
┌──────────────┐
│   IDLE       │◄─────────────────────────────┐
│ (browsing)   │                              │
└──────┬───────┘                              │
       │                                       │
       ├─ Drag detected ──► ┌───────────┐     │
       │                    │  DRAGGING │─────┤
       │                    │  carousel │     │
       │                    └─────┬─────┘     │
       │                          │           │
       │◄──── Drag end ───────────┘           │
       │                                       │
       ├─ Card tapped ──► ┌─────────────┐     │
       │                  │  FLIPPING   │     │
       │                  │   card      │     │
       │                  └──────┬──────┘     │
       │                         │            │
       │◄──── Flip complete ─────┘            │
       │                                       │
       ├─ Selection complete ──► ┌──────────┐ │
       │                         │ COMPLETE │─┘
       │                         │ (ready)  │
       │                         └──────────┘
       │                                │
       │◄── Remove card ────────────────┘
       │
       └─ Continue clicked ──► RESULT SCREEN
```

---

## 🔌 API Changes

### No Backend Changes Required! 🎉

This is purely a **frontend UX enhancement**. Existing APIs:

```typescript
// Current endpoints work as-is:
POST /api/v1/validate-question  // ✓ No change
POST /api/v1/draw-cards         // ✓ No change

// Draw cards payload remains:
{
  "session_id": "...",
  "spread_type": "three_ppf",
  "selected_positions": [0, 1, 2]  // Optional: if user selected specific positions
}
```

---

## 📱 Responsive Breakpoints

```scss
// Mobile (default)
.carousel {
  --card-width: 100px;
  --card-height: 175px;
  --visible-cards: 3;
}

// Tablet
@media (min-width: 768px) {
  .carousel {
    --card-width: 140px;
    --card-height: 245px;
    --visible-cards: 5;
  }
}

// Desktop
@media (min-width: 1024px) {
  .carousel {
    --card-width: 180px;
    --card-height: 315px;
    --visible-cards: 7;
  }
}
```

---

## 🎨 Design Assets Needed

1. **Card Back Design** (mystical)
   - High resolution (for zoom on hover)
   - Golden border effect
   - Mystical pattern

2. **Selected Badge**
   - ⭐ Star icon overlay
   - Golden glow effect
   - Subtle pulse animation

3. **Selection Slot Background**
   - Empty state: "?" or locked icon
   - Filled state: Card frame

4. **Drag Hint Overlay**
   - "ลากเพื่อเลื่อน / Drag to browse"
   - Hand icon animation
   - Auto-dismiss after first drag

---

## 🔄 Migration from Current Flow

### Phase 1: Parallel Implementation
- Keep existing auto-rotate carousel
- Add new interactive carousel as option
- A/B test with users

### Phase 2: Gradual Rollout
- Default to new carousel for new users
- Keep old version as "Quick Mode" option

### Phase 3: Full Replacement
- Remove auto-rotate carousel
- New carousel becomes standard

---

## 📊 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Time on selection screen | 15s | 45s | More engagement = better |
| Card selection completion | 85% | 95% | Fewer drop-offs |
| User satisfaction | ? | +20% | Post-reading survey |
| "Accurate reading" rating | ? | +15% | User feels more connected |

---

## 🎯 Definition of Done

- [ ] All acceptance criteria met
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Works on iOS Safari and Android Chrome
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Animations smooth at 60fps
- [ ] Accessibility audit passed
- [ ] User testing completed (5+ users)
- [ ] Documentation updated

---

**Next Step:** Create technical implementation ticket with component architecture and animation specifications.
