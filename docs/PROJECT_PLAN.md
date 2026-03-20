# CS2 Project Roadmap & Architecture

Welcome to the **CS2 (Facebook Management & HRM)** project. This document outlines the technical vision, current status, and hierarchical roles of the platform.

## 🚀 Completed Phases
### Phase 1: Foundation & UI
- Premium Kanban interface, dynamic Blue/Green theming, and "Master Control" Admin Bar.

### Phase 2: Hierarchical RBAC & Security
- 4-tier access control (Super Admin, Admin, Manager, Staff).
- Data scoping and sensitive credential masking.

### Phase 3: Workspace Calendar & Leave Management
- Work submission tracking, Holidays/2X Pay indicators.
- Leave request workflow for Staff/Super Admin.

### Phase 4: HQ Optimization (Managerial Oversight)
- Team-wide aggregation in HQ Dashboard.
- Restructured navigation for enterprise scalability.

---

## 🗺️ Current & Future Roadmap

### Phase 5: Scalable Data Analytics (CURRENT)
- **Star Schema Implementation**: Refactoring DailyLog and Persistence for high-performance reporting.
- **Multi-channel Ingestion**: Support for API, CSV, and Manual data entry.
- **Monthly Summary System**: Automated aggregation for commission calculation.

### Phase 6: Production & Supabase Migration
- Transition from `localStorage` to **Supabase (SQL)**.
- Secure Auth (Supabase Auth / JWT).
- PDPA Compliance & Financial Precision.

---

> [!NOTE]
> This document is a living file. We update it as we reach new milestones in the development of the "Bulletproof" CS2 system.
