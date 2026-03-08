# 📖 Documentation Index

**Quick lookup for all project documentation**

---

## 🎯 I'm Looking For...

### 🎭 User Stories & Features
👉 [docs/USER-STORIES.md](./USER-STORIES.md) - Master list of all features  
👉 [docs/user-stories/](./user-stories/) - Individual story details

### 🚀 Setup & Installation
👉 [docs/guides/setup.md](./guides/setup.md) - Complete setup guide  
👉 [docs/guides/auto-start.md](./guides/auto-start.md) - One-click start scripts  
👉 [docs/guides/quick-reference.md](./guides/quick-reference.md) - Command cheat sheet

### 🗄️ Database
👉 [docs/guides/database-local.md](./guides/database-local.md) - Local PostgreSQL/SQLite  
👉 [docs/guides/database.md](./guides/database.md) - Cloud database options  
👉 [docs/technical/database-schema.md](./technical/database-schema.md) - Schema documentation

### 🚀 Deployment
👉 [docs/guides/deployment.md](./guides/deployment.md) - Render + Vercel deployment  
👉 [docs/guides/deployment-gcp.md](./guides/deployment-gcp.md) - Google Cloud deployment  
👉 [docs/architecture/infrastructure.md](./architecture/infrastructure.md) - Architecture overview

### 🏗️ Architecture & Technical
👉 [docs/architecture/overview.md](./architecture/overview.md) - System architecture  
👉 [docs/technical/api-spec.md](./technical/api-spec.md) - API endpoints  
👉 [docs/architecture/tech-stack.md](./architecture/tech-stack.md) - Technology choices

---

## 📁 File Structure

```
docs/
├── README.md                          # Documentation overview
├── INDEX.md                          # This file - quick lookup
├── USER-STORIES.md                   # Master user stories list
│
├── user-stories/                     # Individual user stories
│   ├── TEMPLATE.md                   # Template for new stories
│   ├── US-001-gatekeeper.md          # ✅ AI Gatekeeper (Done)
│   ├── US-002-spread-selection.md    # ✅ Spread Selection (Done)
│   ├── US-002-ENHANCE-carousel.md    # 🚧 Interactive Carousel
│   ├── US-002-ENHANCE-summary.md     # Quick summary
│   └── ...                           # Future stories
│
├── guides/                          # How-to guides
│   ├── setup.md                     # Project setup
│   ├── auto-start.md                # Auto-start scripts
│   ├── quick-reference.md           # Command cheat sheet
│   ├── database.md                  # Cloud database options
│   ├── database-local.md            # Local database setup
│   ├── deployment.md                # Render/Vercel deployment
│   └── deployment-gcp.md            # Google Cloud deployment
│
├── architecture/                    # System design
│   ├── overview.md                  # High-level architecture
│   ├── infrastructure.md            # Infrastructure details
│   └── tech-stack.md                # Technology stack
│
└── technical/                       # Technical specs
    ├── api-spec.md                  # API documentation
    └── database-schema.md           # Database schema
```

---

## 🆕 Adding New Documentation

### Adding a User Story

1. Copy `docs/user-stories/TEMPLATE.md`
2. Rename to `US-XXX-feature-name.md`
3. Add entry to `docs/USER-STORIES.md`
4. Update this index

### Adding a Guide

1. Create markdown file in `docs/guides/`
2. Use clear, action-oriented filename
3. Add entry to this index
4. Link from relevant stories

---

## 🔗 Cross-References

| If you're working on... | See... |
|------------------------|--------|
| New feature | [USER-STORIES.md](./USER-STORIES.md) |
| Setting up dev environment | [guides/setup.md](./guides/setup.md) |
| Database issues | [guides/database-local.md](./guides/database-local.md) |
| Deploying to production | [guides/deployment.md](./guides/deployment.md) |
| API changes | [technical/api-spec.md](./technical/api-spec.md) |
| UI/UX changes | [user-stories/US-002-ENHANCE-carousel.md](./user-stories/US-002-ENHANCE-carousel.md) |
| Architecture decisions | [architecture/overview.md](./architecture/overview.md) |

---

## 📊 Documentation Stats

| Category | Files | Status |
|----------|-------|--------|
| User Stories | 4 | ✅ Organized |
| Guides | 7 | ✅ Organized |
| Architecture | 3 | ✅ Organized |
| Technical | 2 | 📝 In Progress |
| **Total** | **16** | **✅ Complete** |

---

## 📝 Maintenance

**Last Updated:** 2026-03-08  
**Next Review:** 2026-03-15  
**Maintainer:** Development Team

To update this index:
1. Add new files to appropriate sections
2. Update stats table
3. Update "Last Updated" date
