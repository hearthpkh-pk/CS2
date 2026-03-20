# CS2 Project Roadmap & Architecture

Welcome to the **CS2 (Facebook Management & HRM)** project. This document outlines the technical vision, current status, and hierarchical roles of the platform.

## 🚀 Current Status: Phase 1 (Complete)
We have successfully built the premium Kanban interface, dynamic Blue/Green theming, and the "Master Control" Admin Bar.

---

## 🏛️ Hierarchical Role Architecture (Phase 2)
The platform is designed around a 4-tier access control system (RBAC) to support enterprise operations:

### 1. Staff (Self-Managed)
- **Scope**: Sees ONLY their own data (Pages, Accounts, Logs, Personal Dashboard).
- **Function**: Daily management of their assigned Facebook fleet.

### 2. Manager (Team Leader)
- **Scope**: Own data + **Team Oversight**.
- **Function**: Can view and monitor the performance of all pages/accounts within their specific team.

### 3. Admin (Operations Manager)
- **Scope**: Own data + **HQ Dashboard** (Global Staff Stats) + **Team Management**.
- **Function**: Can manage user roles, permissions, and team structures for their level or below.

### 4. Super Admin (Master/Founder)
- **Scope**: **Full Master Access** + Global Analytics.
- **Function**: Total visibility across all teams, maximum authority for role management, and access to the **Payroll System**.

---

## 🗺️ Long-Term Roadmap

### Phase 2: Hierarchical RBAC & Security (NEXT)
- Implement `ownerId` and `teamId` scoping.
- Role Simulation & Protected UI views.
- Simulated Login system for role switching.

### Phase 3: Strategic Analytics Dashboard
- High-level health monitoring (Live/Dead/Check stats).
- Automated reporting for Box efficiency.

### Phase 4: Production & Database Migration
- Transition from `localStorage` to **Supabase (SQL)**.
- Secure Auth (JWT/MFA).
- PDPA Compliance & Financial Precision (Payroll).

---

> [!NOTE]
> This document is a living file. We update it as we reach new milestones in the development of the "Bulletproof" CS2 system.
