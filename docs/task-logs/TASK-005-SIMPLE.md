# ✅ TASK-005: Simplified Carousel

**Date:** 2026-03-07  
**Status:** Simple version - no animations

---

## 🎯 Simplified

You asked for simple - here it is:

**NO:**
- ❌ Animations
- ❌ Drag/swipe
- ❌ Framer-motion on carousel
- ❌ Complex physics
- ❌ Fancy effects

**YES:**
- ✅ Arrow buttons (left/right)
- ✅ Click card to select
- ✅ Simple ⭐ badge on selected
- ✅ Counter: "X/Y selected"
- ✅ Clean code

---

## 🎮 How It Works

```
[←] [Card 78] [Card 1] [Card 2★] [Card 3] [Card 4] [→]
                    ↑
              Click any card!
              ★ = Selected

Counter: 1 / 3 ใบที่เลือก
```

**Navigation:**
- Click **←** arrow: Previous card
- Click **→** arrow: Next card  
- Click **any card**: Select it
- Click **dots**: Jump to card

---

## 📝 Code is Simple

```typescript
// Just state
const [currentIndex, setCurrentIndex] = useState(0);

// Simple navigation
const goNext = () => setCurrentIndex(prev => (prev + 1) % cards.length);
const goPrev = () => setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);

// Simple click
onClick={() => handleCardClick(card)}

// Simple styling
{isSelected && <Star className="..." />}
```

**No:**
- useEffect
- useCallback (complex)
- Framer Motion
- Drag handlers
- Animation frames

---

## 🚀 Test It

```bash
cd frontend
npm run dev
```

URL:
```
http://localhost:3000/select?q=test&spread=three_ppf
```

**Try:**
1. Click arrows to move
2. Click any card
3. See ⭐ appear
4. Counter updates

---

## 🛠️ Ready for Enhancement

Now you can enhance **step by step**:

### Step 1: Add smooth slide
```typescript
// Add transition to card container
transition: transform 0.3s ease
```

### Step 2: Add drag
```typescript
// Add simple drag
onMouseDown, onMouseMove, onMouseUp
```

### Step 3: Add flip animation
```typescript
// Add framer-motion AnimatePresence
<AnimatePresence>
  <motion.div rotateY={selected ? 180 : 0} />
</AnimatePresence>
```

### Step 4: Your enhancements...

---

## 📁 Files

| File | Description |
|------|-------------|
| `card-carousel.tsx` | ✅ Simple, clean, minimal |

---

## ✨ Summary

**Before:** Over-engineered with animations  
**After:** Simple and clean  
**Next:** You enhance step by step

**Reference:** TASK-005
