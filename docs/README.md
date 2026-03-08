# 📚 Project Documentation

**Single Source of Truth for Ask The Tarot**

This directory contains all project documentation organized by type.

---

## 📁 Documentation Structure

```
docs/
├── README.md                 # You are here
├── USER-STORIES.md          # Master user stories index
├── PRODUCT-ROADMAP.md       # Current priorities & timeline
├── CHANGELOG.md             # What changed and when
│
├── user-stories/            # Individual user story details
│   ├── US-001-gatekeeper.md
│   ├── US-002-spread-selection.md
│   ├── US-002-ENHANCE-carousel.md
│   └── TEMPLATE.md          # Template for new stories
│
├── guides/                  # How-to guides
│   ├── setup.md
│   ├── deployment.md
│   ├── database.md
│   └── development.md
│
├── architecture/            # System design
│   ├── overview.md
│   ├── tech-stack.md
│   └── data-flow.md
│
└── technical/              # Technical specs
    ├── api-spec.md
    ├── database-schema.md
    └── frontend-components.md
```

---

## 🎯 Quick Navigation

### For Product Managers
👉 Start with [USER-STORIES.md](./USER-STORIES.md) - All features prioritized

### For Developers
👉 Start with [guides/setup.md](./guides/setup.md) - Get running in 5 minutes

### For DevOps
👉 Start with [guides/deployment.md](./guides/deployment.md) - Deploy to production

---

## 📝 How to Add Documentation

### Adding a New User Story

1. Copy `user-stories/TEMPLATE.md`
2. Rename to `US-XXX-feature-name.md`
3. Fill in all sections
4. Add to [USER-STORIES.md](./USER-STORIES.md) index
5. Update [PRODUCT-ROADMAP.md](./PRODUCT-ROADMAP.md)

### Adding Technical Documentation

1. Choose appropriate folder (`guides/`, `architecture/`, `technical/`)
2. Create markdown file with clear name
3. Update this README with link
4. Cross-reference related docs

### Updating Existing Docs

**Rule:** Update the **single source** file, not copies!

| If you need to update... | Go to... |
|-------------------------|----------|
| User story details | `user-stories/US-XXX-*.md` |
| Story priority/status | `USER-STORIES.md` (master index) |
| Setup instructions | `guides/setup.md` |
| API endpoints | `technical/api-spec.md` |
| Database schema | `technical/database-schema.md` |

---

## 🔄 Documentation Workflow

```
New Feature Request
        ↓
Create US-XXX in user-stories/
        ↓
Add to USER-STORIES.md index
        ↓
Update PRODUCT-ROADMAP.md
        ↓
Implement feature
        ↓
Update technical/ docs if needed
        ↓
Update CHANGELOG.md
```

---

## ✅ Documentation Standards

### Every User Story Must Have:
- [ ] Unique ID (US-XXX)
- [ ] Clear user story format
- [ ] Acceptance criteria
- [ ] Status (Draft → In Progress → Done)
- [ ] Priority (P0/P1/P2)

### Every Technical Doc Must Have:
- [ ] Last updated date
- [ ] Related user stories
- [ ] Code examples
- [ ] Troubleshooting section

---

## 🚨 IMPORTANT: Single Source Rule

**Never duplicate information!** Always link to the canonical source.

❌ **Bad:** Copying setup steps to README.md  
✅ **Good:** Link to `guides/setup.md`

❌ **Bad:** Writing user story in README  
✅ **Good:** Link to `user-stories/US-XXX.md`

---

## 📞 Questions?

Documentation maintainer: [Your Name]  
Last updated: 2026-03-07

---

## 📖 All Documentation Files

<!-- AUTO-GENERATED - Run `ls -R docs/` to update -->

### User Stories
- [US-001: AI Gatekeeper](./user-stories/US-001-gatekeeper.md)
- [US-002: Spread Selection](./user-stories/US-002-spread-selection.md)
- [US-002-ENHANCE: Interactive Carousel](./user-stories/US-002-ENHANCE-carousel.md)

### Guides
- [Setup](./guides/setup.md)
- [Deployment](./guides/deployment.md)
- [Database](./guides/database.md)
- [Development](./guides/development.md)

### Architecture
- [Overview](./architecture/overview.md)
- [Tech Stack](./architecture/tech-stack.md)

### Technical
- [API Specification](./technical/api-spec.md)
- [Database Schema](./technical/database-schema.md)
