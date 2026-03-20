# Project Style & UX/UI Guidelines (กฎเหล็กของโปรเจกต์)

เอกสารนี้รวบรวม "กฎเหล็ก" ในการออกแบบและพัฒนาโปรเจกต์ CreatorSpace เพื่อรักษามาตรฐานความพรีเมียมและความสวยงามตามแบบที่ USER ต้องการ

## 1. การใช้งานฟอนต์ (Typography)
- **ภาษาไทย**: ห้ามใช้ฟอนต์ที่มีหัว (Loopless / Sans-serif) โดยเด็ดขาด เช่น `Noto Sans Thai` หรือ `IBM Plex Sans Thai`
- **หัวข้อ (Headings)**: ใช้ฟอนต์ `Outfit` เพื่อความเป็นแฟชั่นและทันสมัย
- **ตัวเลข (Numbers)**: ใช้ฟอนต์ `Inter` แบบ Monospaced style เพื่อให้สถิติต่างๆ เรียงสวยงามและอ่านง่าย
- **ห้ามเด็ดขาด**: ห้ามใช้ฟอนต์ Serif (มีหัว/มีฐานแบบพิมพ์ดีด) หรือฟอนต์พื้นฐานของระบบที่ดูไม่เป็นระเบียบ

## 2. ภาษาการออกแบบ (Design Language)
- **Style Name**: "Premium Minimalist Navy"
- **การใช้สี (Palette)**:
  - **Primary**: Premium Navy Blue (#0a192f) สำหรับ Sidebar และ Main Text
  - **Sidebar Active**: Deep Navy Blue (#172554)
  - **Accent**: Premium Navy Blue (#0f172a) สำหรับปุ่ม Action หลัก (Primary Actions) เพื่อความสุขุมและเป็นทางการ
  - **Highlight**: Golden Yellow (#facc15) สำหรับสถานะสำคัญหรือจุดที่ต้องการการดึงดูดสายตาพิเศษ
  - **Background**: Clean White / Soft Gray (รหัส #fefefe หรือ #f8fafc) เพื่อให้ดูสบายตา
  - **กฎการใช้สี**: "Less is More" ห้ามใช้สีเยอะเกินไป (Limited Palette) เน้นความสะอาดตา
- **Dynamic Theming (Blue/Green Switcher)**:
  - **Pages Mode**: ใช้ชุดโทนสี Blue (#2871df) สำหรับการจัดการคอนเทนต์
  - **Accounts Mode**: ใช้ชุดโทนสี Emerald (#10b981) สำหรับการจัดการบัญชี
  - **Navigation**: ต้องคงสี "Premium Blue" ไว้เสมอเพื่อรักษา Brand Identity แม้จะเปลี่ยนโหมดเนื้อหาก็ตาม
- **Layout & Layering**:
  - ใช้ Card ที่มีขอบมน (Rounded Corners) ขนาดใหญ่ (เช่น `rounded-3xl`)
  - ใช้ Shadow ที่บางและนุ่มนวล (Soft Shadows) เพื่อสร้างมิติชั้นเลเยอร์ (Layering) ไม่ให้ดูแบนเกินไป
  - การจัดวางต้องมี White Space (พื้นที่ว่าง) เพียงพอ ไม่ให้อัดแน่นจนปวดตา

## 3. ประสบการณ์ผู้ใช้ (UX/UI)
- **User-Centric**: ทุกส่วนต้องเข้าใจง่าย ผู้ใช้งานจริงต้องไม่ต้องมองหานาน
- **Minimalism**: ตัดส่วนเกินที่ไม่จำเป็นออก เน้นเฉพาะข้อมูลที่สำคัญ (Data-Driven Design)
- **Icons**: ใช้ `Lucide React` ในสไตล์ Outline ที่มีความหนาเส้นสม่ำเสมอ

- **Tablet/Mobile (Vertical/Horizontal)**: ต้องเปลี่ยนเป็น Mobile Navigation และปรับขนาดตารางให้เลื่อนดูได้ (Responsive Table) โดยไม่เสียสัดส่วน

## 5. การจัดการข้อมูล (Data & Logic)
- **No Hard-coding Rules**:
  - ห้ามเขียนค่าคงที่ทางธุรกิจลงในโค้ด (เช่น อัตราค่าคอมมิชชั่น, เรทการแปลงสกุลเงินบาทเป็น USD)
  - ทุกค่าที่ใช้ในการคำนวณต้องดึงมาจาก `src/constants/hrConfig.ts` หรือ Database เท่านั้น
- **PDPA & Security**: ข้อมูลส่วนตัวพนักงานและพาสเวิร์ด Facebook ต้องถูก Masking ไม่ให้ผู้ไม่มีสิทธิ์มองเห็น

## 6. กฎเหล็กการทำงาน (Development Rules)
- **Planning First**: ต้องเสนอแผนงานและโครงสร้างให้ USER อนุมัติก่อนเริ่ม Coding เสมอ (ช้าๆ แต่มั่นคง)
- **Modular Logic**: แยกส่วน Frontend และ Backend/Logic ให้ชัดเจน ห้ามเขียน Logic ซับซ้อนซ้อนใน UI
- **Concise Files**: แต่ละไฟล์ต้องมีหน้าที่ชัดเจน (Single Responsibility) และไม่ยาวจนเกินไป
- **Total Fidelity (ความละเอียดรอบคอบ)**: ห้ามสรุปข้อมูลแบบผิวเผิน (No Casual Summaries) ทุกเอกสารและโค้ดต้องลงรายละเอียดให้ชัดเจนที่สุด เพื่อให้ทีมงานทุกคนเข้าใจตรงกันและป้องกันความผิดพลาดที่อาจตามมา
