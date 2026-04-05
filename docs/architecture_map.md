# CS2: Architecture Map & RBAC System (คู่มือโครงสร้างระบบและสิทธิ์การใช้งาน)

เอกสารฉบับนี้อธิบาย **โครงสร้างไฟล์หลัก (File Architecture)** ของโปรเจกต์ CS2 พร้อมกับหน้าที่และความรับผิดชอบของแต่ละส่วน เพื่อให้ง่ายต่อการดูแลรักษา (Maintainability) รวมถึงอธิบายระบบ **RBAC (Role-Based Access Control)** แบบละเอียดระดับสมบูรณ์

---

## 🏗️ 1. โครงสร้างระบบหลัก (Core Architecture Map)

โปรเจกต์ใช้โครงสร้างโฟลเดอร์แบบ Feature-Sliced Design ผสมกับ MVC เพื่อแยกส่วนการแสดงผล (UI Layer) ออกจากส่วนตรรกะทางธุรกิจ (Service/Business Logic Layer)

```text
src/
├── app/               # Next.js App Router (page.tsx = Main Router)
├── components/
│   ├── layout/        # Navigation (Sidebar, MobileHeader, MobileBottomNav)
│   ├── dashboard/     # DashboardView + Chart components
│   ├── kanban/        # Page/Account management cards & drawers
│   ├── workspace/     # Calendar, DailyTask, LearningCenter
│   ├── admin/         # TeamManagement + sub-components
│   ├── forms/         # SetupView, TransactionsView
│   ├── ui/            # PlaceholderView, Toast
│   └── brand/         # POCLogo
├── features/          # Feature-sliced modules (self-contained)
│   ├── auth/          # LoginPage
│   ├── company/       # PolicyCenter, CompanySettings, hooks
│   ├── hq-dashboard/  # HQDashboard, PerformanceMatrix
│   ├── payroll/       # PayrollView
│   └── reports/       # ReportsView, ExecutiveStats
├── services/          # Service layer (Business Logic)
│   ├── dataService    # CRUD Pages/Accounts/Logs (localStorage)
│   ├── configService  # CompanyConfig, Policy (localStorage)
│   ├── performanceService  # Daily/Monthly KPI calculations
│   ├── hqDashboardService  # HQ aggregation + RBAC scoping
│   ├── personnelService    # Users/Teams management
│   ├── holidayService      # Holiday/2xPay logic
│   ├── leaveService        # Leave requests
│   └── mockData       # Seed data (Pages, Accounts, Logs)
├── context/           # AuthContext (Session + Role switching)
├── constants/         # hrConfig.ts, personnel.ts (no hardcode)
├── types/index.ts     # All TypeScript interfaces (single source of truth)
└── data/              # mockUsers.ts (26 users: 1 Dev, 2 SA, 1 Admin, 3 Mgr, 20 Staff)
```

### 📁 `src/app` (Application Router - Next.js)
เป็นจุดศูนย์กลางของการ Routing ใน Next.js App Router (เวอร์ชัน 16)
- **`globals.css`**: เก็บตัวแปรสี (Design Tokens) สำหรับทำ Dynamic Theming เช่น โหมด Pages (โทน Blue) และ Accounts (โทน Emerald)
- **`layout.tsx`**: หุ้มหน้าจอทั้งหมดด้วย `AuthProvider`
- **`page.tsx`**: หน้าหลัก (Main Router) ที่ใช้ `currentTab` State ควบคุมการสลับ Component ต่างๆ แทนการเปลี่ยน URL เพื่อความรวดเร็วแบบ Single Page Application พร้อมดึง Service โหลดข้อมูลตั้งต้น

### 📁 `src/components` (UI Components)
เก็บส่วนประกอบหน้าจอที่นำไปใช้ซ้ำได้ แบ่งตามหมวดหมู่เพื่อไม่ให้สับสน:
- **`layout/`**
  - `Navigation.tsx`: ควบคุม Sidebar ซ้ายมือ และ Bottom Nav บนมือถือ โครงสร้างเมนูทั้งหมดขึ้นกับ Role ของผู้ใช้
- **`dashboard/`**
  - เก็บกราฟสรุปผล (PerformanceChart) และหน้าตารางสรุปผลงานพนักงาน (PerformanceMatrixTable) สำหรับดูภาพรวมรายวัน/รายเดือน
- **`kanban/`**
  - หัวใจของการจัดการ Asset: บรรจุการ์ดของหน้าเพจ (PageCard) และบัญชี (AccountCard) มีลิ้นชัก (Drawer) สำหรับแก้ไขข้อมูล และฟีเจอร์ Smart Import 
- **`workspace/`**
  - พื้นที่ทำงานส่วนตัว: บรรจุปฏิทินลงเวลา (CalendarView), หน้ารายงานส่งคลิปรายวัน (DailyTaskView) และศูนย์การเรียนรู้ (LearningCenterView)
- **`admin/`**
  - สำหรับแอดมิน: บริหารจัดการพนักงาน จัดลำดับผังองค์กร ผังทีม (UnitTopology, PersonnelDrawer)
- **`forms/`**
  - กล่องรวมฟอร์มขนาดใหญ่ เช่น `SetupView.tsx` (หน้าจอ Kanban เต็มรูปแบบ) และ `TransactionsView.tsx` (สำหรับบันทึก Log)

### 📁 `src/features` (Feature-sliced Modules)
โมดูลขนาดใหญ่ที่ทำงานด้วยตัวเอง (Self-contained) ได้แก่ส่วนประกอบ UI และ Hooks เฉพาะตัว:
- **`auth/`**: หน้าจอ Log-in จำลอง (Mock) เพื่อสลับ Role ในการทดสอบ
- **`company/`**: "ศูนย์บัญชาการบริษัท" รวม PolicyCenter (กฎบริษัท/ค่าคอม), CompanySettings (เครื่องมือประกาศ/จัดกลุ่ม) และ Custom Hooks สำหรับตั้งค่าต่างๆ
- **`hq-dashboard/`**: หน้าต่างส่องความถี่ของ Manager/Admin สรุป Leaderboard ของทีมและ Risk Radar เตือนภัยเพจมีปัญหา
- **`payroll/`**: สำหรับ Super Admin ใช้ประมวลผลเงินเดือน 
- **`reports/`**: หน้าสำหรับผู้บริหารดึง Report การทำงานแบบรายไตรมาส/รายปี

### 📁 `src/services` (Business Logic & Services)
**จุดสำคัญที่สุดของระบบ (The Brain)** สำหรับดึงข้อมูล คำนวณรายได้ และตรวจสอบสิทธิ์ ห้ามนำ Logic เหล่านี้ไปเขียนปนในไฟล์ UI `*.tsx`
- **`dataService.ts`**: บริหาร CRUD (Create/Read/Update/Delete) สำหรับข้อมูลเพจ, บัญชี Facebook และ Logs ต่างๆ ลง LocalStorage (จะเปลี่ยนเป็น Supabase ในอนาคต)
- **`configService.ts`**: บริหารการบันทึกกฎระเบียบบริษัท (Policies), วันหยุด (Holidays), ประกาศข่าว (Announcements) 
- **`performanceService.ts`**: คำนวณหาสถานะวันทำงานรายบุคคล นำ Logs มาเช็คเป้า 40 คลิป (Attendance / Over / Late) และสรุปยอดวิวเพื่อหาความคุ้มค่า
- **`revenueService.ts`**: เครื่องคิดเลข "กันกระสุน" คิดเป้าหมาย 10M (ค่าปรับ -2000), 10M-99M (+1000) รวบจบเป็น USD โดยปัดเศษไม่มีวันขาดทุน
- **`hqDashboardService.ts`**: กรองข้อมูลให้ตรงตามสิทธิ์ลูกทีม (Manager เห็นเฉพาะทีมตัวเอง) และประเมินความเสี่ยง (Risk Radar) ก่อนส่งไปให้หน้าบ้านสร้างกราฟ
- **`leaveService.ts` & `holidayService.ts`**: จัดการคำขอวันลา และคำนวณวัน Double Pay 2 เท่า
- **`personnelService.ts`**: บริหารแผนก/ผู้ใช้งาน

### 📁 `src/types` (TypeScript Interfaces)
- **`index.ts`**: **The Single Source of Truth** ประกาศ Type ทั้งหมด (Page, FBAccount, User, DailyLog, Role ฯลฯ) ใครเขียนข้อมูลผิด Type ระบบจะแจ้งเตือนทันที ช่วยลดบั๊กลง 90%

### 📁 `src/constants` (System Configuration Variables)
- **`hrConfig.ts`**: จุดตั้งค่า Hard-coded สำหรับอัตราคำนวณแบบ Global ตัวแปรภาษี, และค่าเงินอัตราแลกเปลี่ยน เพื่อป้องกันโปรแกรมเมอร์เผลอนำไป Hard-code ผสมใน UI

---

## 🔐 2. ระบบรักษาความปลอดภัยข้อมูลแบบจำกัดสิทธิ์ (RBAC System - Role-Based Access Control)

ระบบถูกออกแบบมาสำหรับบริษัท HRM โดยเฉียบขาด ด้วยมาตรการ "พนักงานเห็นเฉพาะของตัวเอง, ทีมลีดเห็นของทีมแต่ห้ามเห็นเงินเดือน" ผ่าน 4 ระดับบทบาท:

### 🔰 1. Staff (พนักงานปฏิบัติการลงเพจ)
กลุ่มพลังผู้ขับเคลื่อนองค์กร (Creator / Operator)
- **ขอบเขตข้อมูล (View Scope):** มองเห็น "เฉพาะเนื้อหาและสถิติของชิ้นงานตัวเอง" เท่านั้น (Owned Assets Scope) จะได้เห็นเป้าตนเอง ค่าคอมตนเองตามจริง 
- **สิทธิ์จัดการ (Manage):** 
  - เพิ่ม/ลบ เพจและบัญชีตัวเองในหน้า Kanban
  - ส่งงานคลิปวิดีโอรายวัน (Daily Task) และลาพัก
  - สรุป Dashboard ส่วนตัว และแจ้งเตือนปัญหาต่างๆ ของเพจตนเอง
- **จำกัดสิทธิ์ (Restricted):**
  - ไม่สามารถดูสถิติ, ยอดวิว หรือคลิปงานของเพื่อนร่วมงานคนอื่นได้โดยเด็ดขาด

### ⭐ 2. Manager (หัวหน้าทีม)
ผู้นำส่งเสริมประสิทธิภาพ 
- **ขอบเขตข้อมูล (View Scope):** เข้าถึง HQ Dashboard ดูสถิติการทำงาน Leaderboard ได้ "เฉพาะลูกทีมของตนเอง" (Team-Scoped Visibility)
- **สิทธิ์จัดการ (Manage):** 
  - มองเห็น Page/Account ของลูกทีมทั้งหมดเพื่อคอยประคอง/แก้ปัญหา
  - ดูว่าในทีมใครส่งงานเลท หรือใครผลงานดีที่สุดเพื่อกระตุ้นผลงาน
- **จำกัดสิทธิ์ (Data Stripping):** 
  - 🛑 **"ห้ามเห็นเรื่องเงินเด็ดขาด"**: ข้อมูลการเงิน Projected Bonus/Penalty ทุกบาทจะถูกทำลายทิ้งจาก Payload ในชั้น `hqDashboardService` เพื่อไม่ให้ Manager เห็นเงินเดือน/ค่าตอบแทนลูกทีม

### ⚙️ 3. Admin (ผู้ดูแลระบบ)
ผู้ดูแลความเรียบร้อย Operations ครอบจักรวาล
- **ขอบเขตข้อมูล (View Scope):** มองเห็นเพจ บัญชี สถิติ ของทางบริษัททั้งหมด (Company-wide Scope)
- **สิทธิ์จัดการ (Manage):** 
  - สามารถเข้ามาช่วยตั้งค่า บัญชีส่วนกลาง จัดโครงสร้างฝ่าย แผนกพนักงาน
  - กดคัดท้ายแจ้งเตือน Flag เพจชาวบ้าน (เช่น สั่งซ่อมเพจแดง/โดนปิดกั้น) ส่งตีกลับไปให้ Staff ซ่อม
  - ติดตาม Audit การลงบัญชีของพนักงานทั้งหมด
- **จำกัดสิทธิ์ (Restricted):** 
  - 🛑 ไม่สามารถเข้าถึงสูตรคำนวณเงินเดือน โครงสร้างวันหยุด กฎเกณฑ์ใหญ่ของบริษัทได้

### 👑 4. Super Admin / Developer (ผู้อำนวยการ / เจ้าของระบบ)
กลุ่มผู้มีสิทธิ์ขาดเด็ดขาดและผู้บริหารระดับสูงสุด (The God Mode)
- **ขอบเขตข้อมูล (View Scope):** ข้อมูลทุกอณู ทุกบาททุกสตางค์ (100% Transparency System)
- **สิทธิ์จัดการ (Manage):** 
  - กำกับนโยบายของระบบเข้าถึงหมวด (Enterprise / Payroll / Settings)
  - ปรุงแต่งสูตรค่าคอมมิชชัน กฎหักเงิน อัตราค่าปรับ หรือลดเป้า KPI ให้สอดคล้องกับสถานการณ์ได้แบบ Real-time
  - อนุมัติวันลา, ยอดบัญชีสำหรับทำจ่ายเงิน (Execute Payout) 
  - ล้างข้อมูลถังขยะแบบถาวร (Permanent Data Destruct)

*หมายเหตุ: สิทธิ์การมองเห็น (Visibility Scoping) ทั้งหมดถูกดักล็อกตั้งแต่ฝั่ง Service ทำให้ไม่ว่า UI จะมีช่องโหว่หรือไม่ ข้อมูลนอกสิทธิ์ก็จะไม่เคยเดินทางไปถึงตัว Component ที่หน้าจอผู้ใช้ (Bulletproof Architecture)*
