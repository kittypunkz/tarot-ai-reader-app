# 🎯 US-002-ENHANCE: Quick Summary

## The Problem
Current flow: Cards auto-rotate → user clicks stop → random cards selected ❌  
**User has no control, feels disconnected**

## The Solution
New flow: User drags carousel → browses 78 cards → manually selects → sees cards in panel ✅  
**User feels agency and connection**

---

## Key Changes

### 1. **Interactive Carousel**
```
Before: Auto-rotating infinite loop
After:  User controls with drag/swipe
```

### 2. **Visual Selection**
```
Before: Cards disappear when selected
After:  Cards stay in carousel with ⭐ badge
        + Show selected cards in bottom panel
```

### 3. **Selection Progress**
```
Before: Mystery count (user doesn't know how many picked)
After:  Clear "1/3 selected" counter + card previews
```

---

## User Flow Diagram

```
┌─────────────────┐
│ Type Question   │
│ Pass Gatekeeper │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  📜 "Select cards that call to you"     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ◀──  [78 Cards Carousel]  ──▶  │   │ ← Drag to browse
│  │                                 │   │
│  │  🖱️ Drag / 👆 Swipe to scroll   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │⭐ Fool │ │  [?]   │ │  [?]   │      │ ← Selected slots
│  │ 正位   │ │ Locked │ │ Locked │      │   (0/3)
│  └────────┘ └────────┘ └────────┘      │
│                                         │
│  [  🔮 Reveal Reading  ]               │ ← Disabled until full
│                                         │
└─────────────────────────────────────────┘
```

---

## Technical Specs

### New Dependencies
```bash
npm install @use-gesture/react framer-motion
```

### Components to Build
1. `EnhancedCarousel` - Draggable carousel with physics
2. `SelectionPanel` - Bottom panel showing picks
3. `CardBack` - Mystical card back design
4. `CardFlip` - Flip animation component

### State Management
```typescript
interface SelectionState {
  selectedCards: Card[];      // User's picks
  isDragging: boolean;        // Carousel state
  currentIndex: number;       // Carousel position
}
```

### Performance
- Virtualization: Render only 7 visible cards
- 60fps drag with momentum physics
- < 1s flip animation

---

## Files to Modify

| File | Changes |
|------|---------|
| `app/draw/page.tsx` | Replace carousel with enhanced version |
| `components/` | Add new carousel components |
| `hooks/useCarousel.ts` | Drag/swipe logic |
| `styles/carousel.css` | Animations & transitions |

---

## No Backend Changes! ✅

Existing API works as-is:
```typescript
POST /api/v1/draw-cards
{
  "session_id": "...",
  "spread_type": "three_ppf"
  // Cards selected on frontend, sent to backend
}
```

---

## Acceptance Criteria (Must-Have)

- [ ] User can drag/swipe through 78 cards
- [ ] Selected cards show in bottom panel
- [ ] "X/Y selected" progress indicator
- [ ] Can remove selected cards
- [ ] Works on mobile (touch) and desktop (mouse)
- [ ] Smooth 60fps animations

---

## Nice-to-Have

- [ ] Card flips to show face when selected
- [ ] Sound effects on selection
- [ ] Haptic feedback (mobile)
- [ ] "Shuffle" button to randomize if user is stuck
- [ ] Auto-scroll hint for first-time users

---

## Success Metrics

| Metric | Target |
|--------|--------|
| User engagement time | +200% (15s → 45s) |
| Completion rate | 85% → 95% |
| User satisfaction | +20% |

---

## Priority

**HIGH** - This improves core user experience significantly

## Estimate

**Frontend: 3-5 days**  
- Carousel physics: 1-2 days
- Selection panel: 1 day  
- Animations: 1-2 days

---

**Ready to implement?** Check `user-story-enhanced-card-selection.md` for full details!
