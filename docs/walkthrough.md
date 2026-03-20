# Walkthrough - Kanban Dual-Mode & Persistence

I have implemented a comprehensive dual-mode Kanban system that allows managing both **Facebook Pages** and **Facebook Accounts** within a single, unified interface. This update also includes persistence for user settings and refined Kanban logic.

## Key Features

### 1. Unified Project Vision (Design Doc)
I've created a comprehensive [PROJECT_DESIGN_DOC](file:///C:/Users/heart/.gemini/antigravity/brain/bff5fd36-1167-4957-b27b-300c7abb5bbf/PROJECT_DESIGN_DOC.md) that serves as the "Master Source of Truth" for CS2. This document outlines the core business logic, data architecture, and organizational hierarchy.

### 2. Analytics-First Data Architecture
The system has been refactored to handle high-performance reporting for hundreds of active pages.
- **Granular Logging**: The [DailyLog](file:///c:/dev/CS2/src/types/index.ts#55-69) model now tracks `Reach`, `Engagement`, and `Source` (API/CSV/Manual), ensuring "Bulletproof" data for commission calculations.
- **Scalable Indexing**: Logic in [dataService.ts](file:///c:/dev/CS2/src/services/dataService.ts) now automatically flags and timestamps manual entries, preparing the system for multi-year historical analysis.
- **Attribution Logic**: Designed to support backfilling of missing data, ensuring trend lines remain accurate even if staff members skip entries.

### 3. Hierarchical RBAC (Phase 2 - Security Simulation)
I've implemented a robust 4-tier Role-Based Access Control system to simulate high-level architectural requirements for a "Bulletproof" HRM system.

- **4-Tier Hierarchy**:
    - **Staff**: Owns individual resources (Pages/Accounts). Can only see their own data.
    - **Manager**: Team leader. Sees their own data plus all resources owned by their team members.
    - **Admin**: Full control over team data and organizational setup.
    - **Super Admin**: Master control with global visibility and access to sensitive modules (Payroll Placeholder).
- **Role Switcher (Simulation)**: Added a "Switch Role" dev-utility in the Sidebar to allow instant testing and verification of the RBAC logic across all tiers.
- **Data Scoping & Masking**:
    - **Visibility**: The Kanban board and navigation tabs automatically update based on the active role.
    - **Security**: Staff members are restricted from seeing/copying sensitive account credentials (Password/2FA) for accounts they don't own, even if visible in the UI.
- **Ownership Indicators**: Card-level badges now display the owner's name for Managers and Admins, providing oversight without cluttering the Staff view.

### 4. Workspace Calendar & Leave Management (HRM Hub)
A high-fidelity scheduling system has been integrated into the Workspace category to handle employee time and operations.
- **Dynamic Calendar View**:
    - **Visual Indicators**: Days are color-coded for **Holidays** (Red), **Double Pay (2X)** periods (Orange), and **Work Submissions** (Green).
    - **Event Markers**: Small icons indicate pending or approved leave requests directly on the date grid.
- **Leave Approval Workflow**:
    - **Staff Submission**: A dedicated modal allows staff to submit sick, vacation, or personal leave requests with reasons.
    - **Executive Authorization**: Super Admins have a specialized sidebar view (visible only to them) to approve or reject pending requests, which directly impacts the upcoming payroll system integration.

### 5. Enterprise Hub & HQ Dashboard (Team Overview)
The navigation and dashboard logic have been refined to support high-level organizational oversight while keeping individual workspaces focused.
- **HQ Dashboard (Organization)**: 
    - **Team Aggregation**: Managers and Admins now have access to a dedicated HQ view that aggregates Pages, Accounts, and Activity metrics from the entire team.
    - **Performance Filters**: Includes placeholders for filtering results by specific staff members or page categories.
- **Workspace Reorganization**:
    - **Asset Management**: "Manage Pages & Accounts" has been moved from 'Organization' to 'Workspace'. This change reflects that managing one's own assets is a core daily task for all employees, not just an administrative function.
    - **Focused Content**: The Workspace group now contains all tools needed for an individual's daily operations: Dashboard, Assets, and Logs.

### 6. Enterprise Matrix Navigation (Categorized)
The sidebar has been evolved into a multi-tier categorization system to handle complex enterprise modules.
- **Categorization Hub**:
    - **Workspace (พื้นที่ทำงาน)**: Dashboard & Daily Logs.
    - **Organization (การจัดการองค์กร)**: FB Pages/Accounts & Team Management.
    - **Enterprise (ระบบองค์กร)**: Payroll, [NEW] Reports & Analytics, [NEW] Company Settings.
    - **System (ระบบ)**: [NEW] Activity Audit, [NEW] Help Center.
- **Visual Hierarchy**: Group headers now appear when the sidebar is expanded (Desktop), providing a professional, structured overview of the entire system's capabilities.
- **Future-Ready Roadmap**: All new tabs include elegant "Coming Soon" placeholder views, allowing for immediate visualization of the upcoming UX/UI workflow.

### 7. Dual-Mode Switcher
Users can now toggle between "Pages" and "Accounts" mode directly from the Kanban header.
- **Pages Mode**: Focuses on content management and status monitoring.
- **Accounts Mode**: Focuses on credential management (UID, Password, 2FA, Cookies).

### 2. Advanced Account Management & Smart Import
The account system has been heavily upgraded:
- **Redesigned Editor**: Organized into logical sections (Identity, Credentials, Recovery, Backup, Session) for a cleaner UX.
- **Multi-Email Support**: Added secondary email fields (Email 2 / Backup) often found in bulk account data.
- **Profile URL Support**: Dedicated field for Facebook profile links with a quick-copy button.
- **Smart Import / Paste**: Upgraded parser (now available in both **Add** and **Edit** modes) detects:
  - **UID, Password, 2FA Key**.
  - **Primary & Secondary Emails** (and Email Passwords).
  - **Profile Links** and **Cookies**.
  - **Persistence**: Text now stays in the field after parsing for verification (with a *Clear* button).
- **Admin Bar (Top-Bar)**: Separated Box 0 from the main grid into a sleek horizontal master-control bar at the top.
    - **Clean Grid**: The main Kanban board now starts cleanly from Box 1, ensuring a 1-5, 6-10 sequence without interruption.
    - **Horizontal Scrolling**: Efficiently handles multiple Admin accounts using a smooth custom-scroll horizontal layout.
- **Admin Status & Auto-Sync**: 
    - **Smart Logic**: Selecting *Admin Box* automatically sets the status to *Admin*.
    - **Reversibility**: Selecting *Admin Status* automatically moves the account to the *Admin Box*.
    - **Ease of Use**: This eliminates redundant steps and ensures data integrity.
- **Admin-Page Linking**: 
    - **Multi-Select**: In *Page Editor*, you can now select which Admin accounts are associated with a page.
    - **Visual Badge**: *Page Cards* now show an "ADMIN" badge with the count of linked accounts for quick oversight.
- **Code Modularization**:
    - **Reduced Complexity**: Extracted large UI blocks into focused components ([AdminBar](file:///c:/dev/CS2/src/components/kanban/AdminBar.tsx#24-116), [KanbanColumn](file:///c:/dev/CS2/src/components/kanban/KanbanColumn.tsx#28-117), [SmartImportSection](file:///c:/dev/CS2/src/components/kanban/SmartImportSection.tsx#12-46), `AccountFormGroups`).
    - **Better Maintainability**: [SetupView.tsx](file:///c:/dev/CS2/src/components/forms/SetupView.tsx) and [AccountEditorDrawer.tsx](file:///c:/dev/CS2/src/components/kanban/AccountEditorDrawer.tsx) are now much shorter and easier to navigate.
    - **Scalability**: These new components can be reused or extended independently without affecting the entire view.
- **Universal Blue Theme**:
    - **Unified Master Control (One Block)**: Refactored the Box Admin into a single, cohesive container. The header and its associated account cards now share a unified gradient background and cohesive styling, fulfilling the "one chunk" layout requirement.
## 🎨 Dynamic Theme Switching (Blue/Green)
Implemented a sophisticated dynamic theming system that visually transforms the application based on the active management mode, providing clear visual feedback and a premium user experience.

- **Pages Mode (Blue)**: Maintains the signature "Premium Blue" aesthetic for page management.
- **Accounts Mode (Green)**: Automatically switches to a vibrant "Emerald Green" theme for account management.
- **Sidebar Brand Preservation**: Locked the Navigation Bar to the core "Premium Blue" theme to maintain brand identity. Only the content area (Kanban Board, Headers, and Modals) transitions to Emerald Green, providing a clear functional distinction without compromising the app's primary look.
- **Unified Variables**: All components (Cards, Columns, Header, Drawers) now use theme-aware CSS variables, ensuring 100% color consistency during transitions.

| Feature | Pages Mode (Default) | Accounts Mode (Dynamic) |
| :--- | :--- | :--- |
| **Primary Color** | Blue (`#2871df`) | Emerald (`#10b981`) |
| **Backgrounds** | Soft Blue Tint | Soft Emerald Tint |
| **Hover States** | Dark Blue | Dark Emerald |
| **Buttons & Badges** | Blue-White | Green-White |

- **UI Color Restoration & Global Integration**:
  - **Sidebar Fix**: Restored the deep "Premium Blue" sidebar background and integrated it into the dynamic theme. The sidebar now correctly transitions to Emerald Green in Accounts mode.
  - **Admin Bar Refinement**: Deepened the blue gradient on the "Box Admin" to match the high-contrast, premium look previously approved.
  - **Global Theme Sync**: Lifted the theme state to the application root, ensuring every global component (Sidebar, Headers, etc.) stays in sync with the active management mode.
- **Trash System & Confirmation Logic**:
  - **Soft Delete**: Deleting a page or account now moves it to a "Trash Bin" instead of permanent removal.
  - **Confirmation Modals**: All delete actions now trigger a high-visibility confirmation prompt to prevent accidental data loss. 
    - **Layering Fix**: Updated Modal z-index to ensure it correctly appears above the Trash drawer.
- **Typography & Consistency**:
  - **Normal Font Style**: Removed all **italic** styles from headings, descriptions, and labels across the entire application to achieve a cleaner, more consistent "Sans-serif" look.
- **Improved Sorting & Logic**: 
  - **Live Priority**: "Live" and "Admin" accounts always appear at the top.
  - **Single Live Rule**: Only 1 "Live" account allowed per box (except for Admin box/status).
- **Account Cards**: Now feature color-coded copy buttons for all 7+ data fields (Pass, 2FA, Email 1, Email Pass, Email 2, Cookie, Profile Link).

### 3. Smart Kanban Logic
- **One Active Page per Box**: Automatically ensures that only one page can be set to "Active" status per Kanban box, preventing dashboard clutter.
- **Priority Sorting**: Active pages are automatically floated to the top of their respective boxes for better visibility.

### 4. Persistence of Settings
- **Box Visibility**: The user's selection of active Kanban boxes is now saved to `localStorage`, ensuring the board layout remains consistent across sessions.

## Technical Implementation & Refactoring
- **Modular Component extraction**: Refactored [SetupView.tsx](file:///c:/dev/CS2/src/components/forms/SetupView.tsx) by extracting UI components into `src/components/kanban/`.
  - `KanbanHeader.tsx`, `PageCard.tsx`, `AccountCard.tsx`, `PageEditorDrawer.tsx`, `AccountEditorDrawer.tsx`, `BoxConfigModal.tsx`.
- **Styling Alignment**: Standardized `AccountCard` and `AccountEditorDrawer` to match the "Page" styling.
  - Used consistent border-hover effects (`[var(--primary-blue)]`) and status colors (`emerald-100`).
  - Replaced account status dropdown with premium segmented buttons.
- **Improved Maintainability**: Greatly reduced `SetupView.tsx` complexity while maintaining 100% of the core logic and persistence features.
- **Data Models**: Defined `FBAccount` interface in `types/index.ts`.
- **Services**: Extended `dataService.ts` with dedicated account storage logic.
