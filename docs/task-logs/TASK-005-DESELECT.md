# ✅ TASK-005: Click Selected Card to Deselect

**Date:** 2026-03-07  
**Status:** Users can now click selected cards on the wheel to deselect them

---

## 🎯 New Feature

Users can now **click on a selected card** in the carousel/wheel to deselect it, instead of clicking the X button in the panel.

---

## 🎮 How It Works

### Before:
1. Click card in wheel → Selected ✅
2. Click X in panel → Deselected ❌ (had to move mouse to panel)

### After:
1. Click card in wheel → Selected ✅
2. **Click same card again** in wheel → Deselected ✅ (stay in wheel!)

---

## 📱 User Experience

```
User clicks Card 5 (not selected)
    ↓
Card 5 gets ⭐ badge (selected)
    ↓
Counter: "1/3"
    ↓
User changes mind
    ↓
User clicks Card 5 again (already selected)
    ↓
Card 5 ⭐ badge removed (deselected)
    ↓
Counter: "0/3"
```

---

## 🔧 Technical Changes

### 1. CardCarousel Component
```typescript
// New prop
interface CardCarouselProps {
  ...
  onCardDeselect?: (cardId: string) => void;
}

// Updated click handler
const handleCardClick = useCallback((card: TarotCard) => {
  if (hasDragged) return;
  
  // If already selected, deselect it
  if (isCardSelected(card.id)) {
    onCardDeselect?.(card.id);
    return;
  }
  
  // If not selected and can select more, select it
  if (!canSelectMore) return;
  onCardSelect(card);
}, [hasDragged, isCardSelected, canSelectMore, onCardSelect, onCardDeselect]);
```

### 2. EnhancedCardSelection Component
```typescript
// New function to handle deselect from carousel
const handleCardDeselect = useCallback((cardId: string) => {
  setSelectedCards((prev) => {
    const newCards = prev.filter((card) => card.id !== cardId);
    return newCards.map((card, i) => ({ ...card, position: i }));
  });
}, []);

// Pass to carousel
<CardCarousel
  ...
  onCardDeselect={handleCardDeselect}
/>
```

---

## ✨ Visual Feedback

- Selected cards show **pulsing ⭐ badge**
- Selected cards have **gold border + glow**
- **Hover effect** on selected cards (stronger glow)
- Instructions updated: "คลิกไพ่ที่เลือกแล้วเพื่อยกเลิก"

---

## 🚀 Test It

```bash
cd frontend
npm run dev
```

**Try:**
1. ✅ Click any card to select (see ⭐)
2. ✅ Click the **same card again** to deselect (⭐ disappears)
3. ✅ Counter updates correctly
4. ✅ Panel updates correctly
5. ✅ No need to click X in panel anymore!

---

## 📁 Files Changed

| File | Changes |
|------|---------|
| `card-carousel.tsx` | Added `onCardDeselect` prop, updated click handler |
| `EnhancedCardSelection.tsx` | Added `handleCardDeselect` function, passed to carousel |

---

## ✅ Summary

| Action | Before | After |
|--------|--------|-------|
| Select card | Click in wheel | Click in wheel ✅ |
| Deselect card | Click X in panel | **Click card again in wheel** ✅ |

Much more intuitive! 🎉

---

**Reference:** TASK-005
