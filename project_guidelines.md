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
  - **Accent**: Golden Yellow (สำหรับปุ่ม Action และสถานะสำคัญ)
  - **Background**: Clean White / Soft Gray (รหัส #fefefe หรือ #f8fafc) เพื่อให้ดูสบายตา
  - **กฎการใช้สี**: "Less is More" ห้ามใช้สีเยอะเกินไป (Limited Palette) เน้นความสะอาดตา
- **Layout & Layering**:
  - ใช้ Card ที่มีขอบมน (Rounded Corners) ขนาดใหญ่ (เช่น `rounded-3xl`)
  - ใช้ Shadow ที่บางและนุ่มนวล (Soft Shadows) เพื่อสร้างมิติชั้นเลเยอร์ (Layering) ไม่ให้ดูแบนเกินไป
  - การจัดวางต้องมี White Space (พื้นที่ว่าง) เพียงพอ ไม่ให้อัดแน่นจนปวดตา

## 3. ประสบการณ์ผู้ใช้ (UX/UI)
- **User-Centric**: ทุกส่วนต้องเข้าใจง่าย ผู้ใช้งานจริงต้องไม่ต้องมองหานาน
- **Minimalism**: ตัดส่วนเกินที่ไม่จำเป็นออก เน้นเฉพาะข้อมูลที่สำคัญ (Data-Driven Design)
- **Icons**: ใช้ `Lucide React` ในสไตล์ Outline ที่มีความหนาเส้นสม่ำเสมอ

## 4. ความยืดหยุ่น (Responsiveness)
- **Cross-Platform**: ต้องรองรับการแสดงผลทุกหน้าจอ
  - **Desktop**: Layout ครบถ้วนพร้อม Sidebar
  - **Tablet/Mobile (Vertical/Horizontal)**: ต้องเปลี่ยนเป็น Mobile Navigation และปรับขนาดตารางให้เลื่อนดูได้ (Responsive Table) โดยไม่เสียสัดส่วน
