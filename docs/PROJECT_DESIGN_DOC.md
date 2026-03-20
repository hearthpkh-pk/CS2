# CS2: Active Page Management & Performance Analytics
**Version:** 1.0.0 (Enterprise Edition)

## 1. Project Vision
ระบบบริหารจัดการ "เพจเฟซบุ๊กที่ใช้งานจริง" (Active Pages) เพื่อรวมศูนย์สถิติ, ตรวจสอบสถานะการทำงาน, และคำนวณผลงานพนักงาน (Performance/Commission) อย่างแม่นยำ

## 2. Core Architecture: Analytics & Simplicity
โครงสร้างข้อมูลถูกออกแบบมาเพื่อความแม่นยำสูง (Precision) และประหยัดทรัพยากร (Efficiency):

### 2.1 Data Strategy (Supabase Ready)
- **Granularity**: เก็บข้อมูลรายวัน (Daily Logs) เพื่อนับ "วันทำงาน" และ "สถิติรายวัน"
- **Backfilling Logic**: รองรับการลงข้อมูลย้อนหลังเพื่อให้กราฟสถิติ (Trend Line) มีความเสถียรที่สุด
- **Monthly Aggregation**: ระบบสรุปผลรายเดือนเพื่อใช้คำนวณผลงานพนักงาน (Commission/Incentive)

### 2.2 Income & Currency
- **Base Currency**: คำนวณผลงานเป็น **THB** (บาท) ตามสถิติ Views/Followers
- **Payout Currency**: แปลงยอดสุทธิเป็น **USD** สำหรับการโอนผ่าน Exchange ต่างประเทศ
- **No Overheads**: ตัดความซับซ้อนเรื่องภาษี, โอที, และการตอกบัตรออก (เน้นแค่ส่งงาน/ไม่ส่งงาน)

### 2.3 Ingestion Strategy (ช่องทางการนำข้อมูลเข้า)
1. **API Integration**: ดึงอัตโนมัติจาก Facebook Graph API
2. **Manual Entry**: พนักงานกรอกเองรายวัน เพื่อความ Real-time
3. **CSV Upload**: นำเข้าข้อมูลย้อนหลังปริมาณมาก

## 3. Organizational Structure (RBAC)
โครงสร้างผังองค์กรและการกำหนดสิทธิ์ (Role-Based Access Control) ถูกออกแบบมาเพื่อการบริหารจัดการทีมขนาดใหญ่ (15-20 คนขึ้นไป) โดยแบ่งออกเป็น 4 ระดับ:

### 3.1 Staff (พนักงานปฏิบัติการ)
- **Scope**: เห็นเฉพาะข้อมูลของตัวเอง (Owned Assets Only)
- **Responsibilities**:
    - จัดการ Facebook Pages และ Accounts ที่ได้รับมอบหมาย
    - บันทึกสถิติรายวัน (Daily Logs) ของเพจตัวเอง
    - ตรวจสอบสถานะการทำงานผ่าน Dashboard ส่วนตัว
    - ยื่นคำร้องขอลาผ่านระบบ Workspace Calendar

### 3.2 Manager (หัวหน้าชุด/หัวหน้าทีม)
- **Scope**: เห็นข้อมูลตัวเอง + ข้อมูลของพนักงานทุกคนในทีม (Team-wide Scope)
- **Responsibilities**:
    - กำกับดูแลประสิทธิภาพการทำงานของลูกทีมผ่าน **HQ Dashboard**
    - ตรวจสอบความสม่ำเสมอในการส่ง Log ของลูกทีม
    - มอนิเตอร์สถานะความพร้อม (Health) ของเพจทั้งหมดในความดูแล
    - ให้คำปรึกษาและแก้ไขปัญหาเบื้องต้นในระดับทีม

### 3.3 Admin (ผู้จัดการฝ่ายปฏิบัติการ)
- **Scope**: เห็นข้อมูลของทุกทีมในความดูแล + ระบบจัดการผู้ใช้ (Multi-team Scope)
- **Responsibilities**:
    - จัดการโครงสร้างทีม (สร้างทีม/ย้ายพนักงาน)
    - บริหารจัดการบัญชีผู้ใช้และกำหนดสิทธิ์ (User/Role Management)
    - ตรวจสอบความถูกต้องของสถิติรวมก่อนส่งให้ Super Admin
    - ตั้งค่าระบบเบื้องต้น (เช่น เพิ่มช่องทางการนำเข้าข้อมูล)

### 3.4 Super Admin (เจ้าของระบบ/ผู้บริหารสูงสุด)
- **Scope**: สิทธิ์ขาดสูงสุด (Full Master Access) เห็นข้อมูลทุกอย่างทั่วทั้งองค์กร
- **Responsibilities**:
    - อนุมัติการลาและประมวลผลผลงานรายเดือน (Final Approval)
    - เข้าถึงระบบจ่ายเงิน (Incentive/Commission) และแปลงสกุลเงินเป็น USD
    - แก้ไข/ลบ ข้อมูลที่ผิดพลาดในระดับฐานข้อมูล
    - กำหนดนโยบายและค่าคงที่ของระบบ (เช่น อัตราค่าคอมมิชชั่น)

## 4. Technical & Separation Rules
เพื่อให้ระบบดูแลรักษาง่ายและ Logic ไม่ปนกัน:
- **Frontend/Backend Separation**: แยกไฟล์ UI (Component) ออกจากไฟล์คำนวณ (Service/Logic) อย่างเด็ดขาด ห้ามเขียนฟังก์ชันคำนวณซับซ้อนในหน้า UI
- **Modular Components**: แต่ละไฟล์ต้องไม่ยาวเกินไป แบ่งเป็นส่วนย่อยๆ เพื่อความชัดเจน
- **Planning First**: ต้องสรุปแผนและโครงสร้างงานให้ชัดเจนก่อนเริ่มเขียนโค้ดทุกครั้ง (ช้าๆ แต่มั่นคง)

## 4. Key Performance Metrics
- **Followers Growth**: อัตราการเติบโตของผู้ติดตาม
- **Monthly Views**: ยอดรวมวิวรายเดือน (ใช้คำนวณ Commission)
- **Page Health**: สถานะความพร้อมของเพจ (ใช้งานปกติ / ติดข้อจำกัด / เพจมีปัญหา)

## 5. Technical Stack
- **Frontend**: Next.js (TypeScript) + Tailwind CSS (Native)
- **Icons**: Lucide React (Enterprise Matrix)
- **Backend (Future)**: Supabase (PostgreSQL)
- **Data Model**: Star Schema Inspired (Fact-Dimension)

---
*เอกสารนี้จัดทำขึ้นเพื่อให้ทีมงานทุกคนเห็นภาพรวมและทิศทางของโปรเจกต์ตรงกัน*
