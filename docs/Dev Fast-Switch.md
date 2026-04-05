# 📋 Technical Specification: Dev Fast-Switch & Impersonation (View As)

แผนงานนี้กำหนดแนวทางและขั้นตอนการปรับแต่งระบบสิทธิ์การเข้าถึง (Authentication & Authorization) ของโปรเจกต์ CS2 เพื่อเพิ่มประสิทธิภาพในการพัฒนา (Development Phase) และดูแลรักษาระบบ (Administration Phase) โดยให้ความสำคัญต่อความปลอดภัยสูงสุด

---

## 🚀 เฟส 1: Dev Fast-Switch (สำหรับขั้นตอน Development)
**วัตถุประสงค์:** สร้างทางลัดการผ่านเข้าสู่ระบบสำหรับนักพัฒนา (Developer Bypass) บนเครื่อง Local Environment (`NODE_ENV === 'development'`) เพื่อลดเวลาในการพิมพ์บัญชีผู้ใช้งาน

### 1.1 ปรับปรุงบริการยืนยันตัวตน (`src/context/AuthContext.tsx`)
- **สร้าง State ใหม่:** เพิ่ม `bypassMode: boolean` และ `devOverrideUser: (user: User) => void` ลงใน `AuthContextType`
- **การจัดการ Session:** ปรับแต่ง `useEffect` ภายใน `AuthProvider` เพื่อดักจับเงื่อนไขว่า หากอยู่ในสภาวะ `override` ระบบจะไม่ร้องขอ Session จาก Supabase ชั่วคราว แต่จะบังคับใช้ข้อมูล Mock ที่ส่งเข้ามาแทน
- **การจำลองสิทธิ์ (Mocks):** เรียกข้อมูลตั้งต้นจากโฟลเดอร์ `src/data/mockUsers.ts` เพื่อการสลับสิทธิ์ได้ตรงตามโครงสร้าง Database ที่มีอยู่

### 1.2 สร้างส่วนติดต่อผู้ใช้งานแบบซ่อน (Hidden UI Layer)
- **สร้าง Component ใหม่ (`src/features/auth/components/DevToolsQuickLogin.tsx`)**: จะมีปุ่มขนาดเล็กที่แสดงผลเฉพาะมุมหน้าจอ ประกอบไปด้วยปุ่มเข้าสู่ระบบอัตโนมัติ 4 ระดับ: 
  - 🟢 Staff Mode 
  - 🟡 Manager Mode 
  - 🔴 Admin Mode 
  - 🟣 Super Admin Mode
- **บูรณาการเข้ากับหน้าเข้าสู่ระบบ (`src/features/auth/LoginPage.tsx`)**:
  ```tsx
  {process.env.NODE_ENV === 'development' && (
      <DevToolsQuickLogin 
         onBypass={(mockUser) => devOverrideUser(mockUser)} 
      />
  )}
  ```

---

## 👁️ เฟส 2: ระบบสวมรอยสิทธิพิเศษ "View As" (สำหรับ Production/Super Admin)
**วัตถุประสงค์:** อนุญาตให้ Super Admin สามารถจำลองมุมมองของพนักงานท่านอื่นเพื่อเข้าแก้ปัญหา (Troubleshooting) บนระบบจริง โดยหลีกเลี่ยงการเปลี่ยนแปลงข้อมูลฐานข้อมูลหรือการใช้รหัสผ่านพนักงาน

### 2.1 สถาปัตยกรรมระบบจำลองใน Context (`src/context/AuthContext.tsx`)
ระบบจะต้องรองรับรูปแบบ "วิญญาณสวมร่าง" (Ghost Profile Entity):
- **จัดเก็บร่างเดิม (Original Identity):** พัฒนาสถานะ `originalSuperAdminUser: User | null` เพื่อไม่ให้บัญชีผู้ดูแลสูญหาย 
- **จัดการร่างทรง (Impersonated Identity):** ปรับสถานะ `user` ให้เป็นข้อมูลของพนักงานท่านนั้นๆ ไปตลอดระยะเวลาที่จำลอง 
- **เพิ่มฟังก์ชัน:** สร้างคำสั่ง `impersonateUser(targetUserId: string)` และ `revertImpersonation()` ใน Auth Provider

### 2.2 ป้องกันความสับสนของผู้ดูแลระบบ (Impersonation Floating Banner)
การสวมรอยจะทำบน Global Layout เพื่อให้เกิดผลกระทบทั่วทั้งระบบ:
- **สร้าง Component `src/components/layout/ImpersonationBanner.tsx`**: แบนเนอร์คาดบนสุดของ Application 
- **ตัวอย่างการแสดงผล**: 
  > ⚠️ "โหมดผู้ดูแลระบบ: ผู้ช่วยอยู่ระหว่างซ้อนสถานะของพนักงาน [ชื่อพนักงาน]" - *[ปุ่มกลับสู่สถานะ Admin]*
- นำเข้า Banner นี้ในโฟลเดอร์ `src/app/layout.tsx` เพื่อให้แสดงผลในทุกหน้าที่เข้าไปตรวจสอบ

### 2.3 จุดเชื่อมโยงการทำงาน (Injection Point)
- เพิ่มปุ่มลูกเล่น "มุมมองพนักงาน (View As)" ลงภายในตารางพนักงาน (Personnel Table) หรือผังองค์กร  `src/components/admin/team/UnitTopology.tsx`
- การกดปุ่มจะเป็นการเรียกใช้ `impersonateUser(targetUserId)` ใน `AuthContext` 

### 2.4 ปรับกลไกกรองข้อมูลทางธุรกิจ (Business Logic Services Adjustment)
เพื่อให้สอดรับกับ Row-Level Security (RLS) ของ Backend เนื่องจากผู้ดูแลดึงข้อมูลมาได้ 100% แต่พนักงานทั่วไปดึงได้ต่างกัน:
- ในฟังก์ชันของโฟลเดอร์ `src/services/` (เช่น `getMetrics` ใน `hqDashboardService`) จะต้องตรวจสอบว่า `user.id` ไม่ใช่ของ Admin ให้ทำการ "คัดกรองข้อมูลระดับฝั่งหน้าบ้าน" (Client-side Filtering) อ้างอิงจาก ID ของพนักงานที่จำลอง เพื่อให้แสดงผลลัพธ์แบบเดียวกันกับที่พนักงานจะได้รับจริงๆ

## 🔒 แนวทางด้านความปลอดภัย (Security Standard Compliances)
- หากข้อมูลใน Database มีการพึ่งพาศูนย์กลางเวลา (Timely data interaction) *การแก้ไขข้อมูลต่างๆ (Insert/Update)* ระหว่างที่อยู่ในโหมด Impersonation จะถูกห้าม เพื่อลดความขัดแย้งเชิง Transaction
- Dev Fast-Switch ถือเป็นความเสี่ยงระดับสูงหากหลุดไปยัง Production โค้ดที่ครอบต้องได้รับการตรวจสอบผ่าน Next.js build optimization ว่าถูกจำกัดเพียงเครื่อง Local สภาพแวดล้อม Development เท่านั้น
