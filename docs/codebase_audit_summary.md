# 📊 CS2 Codebase & Architecture Audit Report

## 1. Executive Summary
CS2 (Creator Space / Editor Platform HQ) เป็นระบบ Enterprise-grade HRM และ Performance Management ที่ถูกออกแบบมาเพื่อจัดการทีมงานดูแลเพจ Facebook จุดเด่นของ Architecture คือการผสมผสานระหว่างระบบ HR (เงินเดือน, ลางาน, กฎบริษัท) เข้ากับระบบ Operation (สถิติเพจรายวัน, ยอดวิว, สต็อกบัญชีเพจ) อย่างแนบเนียน โดยมีเป้าหมายหลักคือความแม่นยำทางการเงิน (Precision) และประสิทธิภาพ (Scalability)

---

## 2. Core Technologies (Tech Stack)
- **Frontend Core**: Next.js 14 (App Router), React 18
- **Language**: TypeScript (Strict typing enforcement)
- **Styling**: Tailwind CSS (Native, Custom Variables in `globals.css`)
- **Backend / DB**: Supabase (PostgreSQL) + Row-Level Security (RLS)
- **Client Caching**: IndexedDB (`logCacheService.ts`) ชูจุดเด่น "Zero-Cost Architecture"
- **State/Context**: Standard React Context (`AuthContext.tsx`) + Custom Hooks

---

## 3. Database Architecture (Supabase Schema)
การออกแบบฐานข้อมูลเน้น **Data Integrity** สอดคล้องกับคุณสมบัติของระบบ "Bulletproof HR":
*   `00_auth_schema.sql` / `07_extend_profiles_hr_fields.sql`: ซิงค์ `auth.users` เข้ากับตาราง `profiles` อัตโนมัติผ่าน Database Trigger. เก็บฟิลด์ HR ลึกถึง Start Date, Bank Account และบังคับ Default Salary เป็น `12000` (เป็น Integer/Decimal ป้องกัน Floating Point Error).
*   `01_core_schema.sql`: มีตาราง `facebook_pages` และ `daily_logs` 
    *   **[CRITICAL PATTERN]** มี `UNIQUE(page_id, date)` ในตาราง `daily_logs` เพื่อ**กันกระสุน** ห้ามส่งงานซ้ำเพจเดิมในวันเดียวกันเด็ดขาด
*   `02_personnel_schema.sql`: `leave_requests` มี `CONSTRAINT valid_date_range CHECK (end_date >= start_date)` บังคับข้อมูลลางานให้ตรรกะถูกต้องในระดับฐานข้อมูล
*   `05_company_config_schema.sql`: รูปแบบ `Global Config` เทิร์นข้อมูลกฎ/โบนัส/เรตขั้นต่ำ เป็น `JSONB` บนฐานข้อมูล พร้อมการทำ fallback-default บนโค้ด

---

## 4. Key Architectural Patterns & Observations

### 4.1. "Zero-Cost" Dashboard Data Strategy
ไฟล์ `logCacheService.ts` แสดงให้เห็นถึงเทคนิคชั้นสูงในการประหยัด Supabase Read Requests (Cost-saving):
*   ตัวระบบดึง Logs มาแคชทั้งหมดลง **IndexedDB** 
*   ครั้งต่อไปที่ดึง จะใช้กลยุทธ์ **Delta Sync** คว้ามาเฉพาะ Logs ที่ `created_at` ใหม่กว่า `lastSyncAt` 
*   **Fallback:** มี On-memory Map `memoryFallback` สำรองกรณีโหมด Incognito

### 4.2. Time Attendance (Operations vs Clock-in)
ระบบ CS2 **ไม่มีการตอกบัตรเช้า-เย็นปกติ** แต่ใช้ระบบ **Activity-Based Attendance**:
*   อ้างอิงจาก `performanceService.ts` ระบบจะประเมินสถานะรายวัน (`WORKED`, `LATE`, `INCOMPLETE`, `ABSENT`) จากจำนวนคลิปที่ส่งในช่องทาง `daily_logs` เทียบกับเวลาสิ้นสุดเที่ยงคืน (`Deadline < 00:00`) ประกอบกับการตรวจสอบตารางการลางานเชิงซ้อน
*   **Timezone Safe Pattern:** โค้ดเลี่ยงการใช้ `new Date()` ตรงๆ แต่ใช้ `string` format `YYYY-MM-DD` เป็น Primary Key ฝั่ง Client เพื่อลดปัญหา UTC Shift ให้เหลือน้อยที่สุด (Timezone Thailand +7)

### 4.3. Precise Payroll & Commission
ไฟล์ `revenueService.ts` และ `hrConfig.ts`:
*   ฐานเงินบาท ใช้หน่วยเต็ม ไม่คำนวณซับซ้อนทศนิยมโดยไม่จำเป็น 
*   มีการแบ่ง Tier การจ่ายโบนัสชัดเจน (Under 10M, Base 10M, Super 100M)
*   **Exchange Rate Precision:** การแปลงเงิน USD ใช้ `Math.ceil(usd * 100) / 100` ปัดเศษขึ้นที่ทศนิยมตำแหน่งที่สองเพื่อคุ้มครองผลประโยชน์คนทำงานตามทฤษฎีบัญชี

### 4.4. Role-Based Access Control (RBAC)
ไฟล์ `Navigation.tsx` และ Supabase Policies วางสิทธิ์ไว้ 5 ชั้น:
1.  **Staff**: ปฏิบัติงาน ดูเพจ/พอร์ตตัวเอง
2.  **Manager**: หน้าต่าง HQ Dashboard คุมทีม
3.  **Admin**: ระบบจัดการพนักงานทั้งหมด (Pending Approval) รันทีม/ตารางงาน
4.  **Super Admin**: ชี้ขาด Payroll อนุมัติการลา สิทธิ์สูงสุด
5.  **Developer**: สิทธิ์ทดสอบและ Debug

---

## 5. Potential Bottlenecks & Strict Technical Constraints

1.  **Date String Mutation (`useCalendarLogic.ts`)**: การแปลงค่า Date ระหว่างระบบปฏิทิน (Date Object) และฐานข้อมูล (YYYY-MM-DD String) ทำได้ค่อนข้างดี แต่ต้อง **ระวังอย่างหนัก** หากจะมีการแก้ไข ห้ามหลุดกลับไปใช้ `.toISOString()` ถ้าต้องการแค่วันที่ (เพราะติด UTC Offset จะทำให้ข้ามวันในเวลาตี 5 - 7 โมงเช้าไทย)
2.  **Number Precision**: ค่า `salary` ถูกเก็บเป็น `Decimal(15,2)` ใน DB แต่เวลาทำ Aggregation ใน Javascript (`views`, `clipsCount`) จะใช้ `reduce` ปกติ ต้องระมัดระวังห้ามใช้ Math/Floating points ที่ซับซ้อนกับตัวเลขฐานการเงินหรือ Penalty
3.  **React Strict Mode & Auth Locks**: บริเวณ `supabaseClient.ts` มีการ bypass `navigator.locks` เพื่อข้ามปัญหา Lock Contention ในจังหวะ Development อันนี้เป็นวิธีแก้ที่สร้างสรรค์ แต่อาจจะต้องระวังในอนาคตหาก Supabase บังคับ Validate.

## 6. Conclusion
ระบบนี้มีรากฐานข้อมูลและการวาง Layer ที่ "กันกระสุน" สมบูรณ์แบบ ไฟล์โค้ดส่วนใหญ่มีการแยกส่วนความรับผิดชอบ (Separation of Concerns) มาดีเยี่ยม (Services > Components > UI) โครงสร้างโค้ดชุดนี้พร้อมสำหรับการสร้างฟีเจอร์ระดับ Enterprise เพิ่มเติมได้ทันที
