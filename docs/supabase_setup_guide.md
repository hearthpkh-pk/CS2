# Supabase Setup Guide (คู่มือจับมือทำ)

ทำตามขั้นตอนด้านล่างนี้เพื่อสร้าง Backend จริงสำหรับระบบ CS2:

### 1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com)
1. กด **New Project**
2. ตั้งชื่อ: `CS2-Editor-HQ`
3. กำหนด Password สำหรับ Database (จดไว้ด้วยนะครับ)
4. เลือก Region เป็น **Singapore (ap-southeast-1)** เพื่อความเร็วในการเชื่อมต่อจากไทย
5. รอระบบ Provisioning ประมาณ 1-2 นาที

---

### 2. ตั้งค่าความปลอดภัย (Bulletproof Security)
1. ไปที่เมนู **Authentication** (ไอคอนรูปโล่) -> **Providers** -> **Email**
2. เลื่อนหาหัวข้อ **"Allow public signups"** แล้วปรับเป็น **OFF (ปิด)**
3. **ผลที่ได้:** จะไม่มีใครสามารถสมัครผ่านหน้าเว็บเองได้ นอกจาก "คุณ" จะเป็นคนกด **"Invite User"** ส่งอีเมลหาพนักงานคนนั้นเท่านั้นครับ

---

### 3. ติดตั้งตาราง Profile และระบบสมัครสมาชิกอัตโนมัติ (Trigger)
1. ที่แถบเมนูซ้ายมือ เลือกไอคอน **SQL Editor**
2. กดปุ่ม **+ New Query**
3. คัดลอกเนื้อหาจากไฟล์ `supabase/migrations/00_auth_schema.sql` ในโปรเจกต์นี้ไปวาง
4. กดปุ่ม **Run** (ด้านล่างขวา)
5. **ผลที่ได้:** คุณจะได้ตาราง `profiles` อัตโนมัติ และทุกครั้งที่มีคน Login ครั้งแรก ระบบจะสร้าง Profile ให้อัตโนมัติครับ

---

### 3. เชื่อมต่อแอป Next.js กับ Supabase
1. ไปที่เมนู **Project Settings** (ไอคอนฟันเฟืองด้านล่าง)
2. เลือกแถบ **API**
3. คัดลอกค่า **Project URL** และ **anon public API Key**
4. นำไปวางในไฟล์ `.env.local` ในโปรเจกต์ของคุณ ดังนี้:

```text
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

---

### 4. เปิดใช้งานสิทธิ์เข้าถึง (RLS)
1. ไปที่เมนู **Database** -> **Tables**
2. เลือกตาราง `profiles`
3. ตรวจสอบว่า **RLS is Enabled** (ถ้ายัง ให้กด Enable)
4. ผมเตรียม SQL สำหรับตั้งค่า RLS ขั้นพื้นฐาน (เช่น พนักงานเห็นเฉพาะข้อมูลตัวเอง) ไว้ใน `supabase/migrations/01_rbac_foundation.sql` ครับ

> [!TIP]
> เมื่อคุณทำขั้นตอนข้างต้นเสร็จแล้ว ให้บอกผมนะครับ ผมจะเริ่มทำการ Refactor `src/context/AuthContext.tsx` เพื่อให้ระบบใช้งานได้จริงทันที!
