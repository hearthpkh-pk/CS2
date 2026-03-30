# กฎเหล็กการออกแบบปุ่ม (Golden Rules of Button Design)

จากการถอดรหัส (Reverse Engineer) คลาสและสไตล์ทั้งหมด ในหน้า **Facebook Page Setup** (`KanbanHeader`, `PageEditorDrawer` และ `SetupView`) นี่คือ "สูตรลับ" โครงสร้างการออกแบบปุ่มที่ทำให้หน้านี้ดูแพงที่สุดครับ

> [!TIP]
> **Key หลักที่ทำให้ดูแพง:** คือการใช้ความโค้งระดับ **`rounded-2xl` (16px)** เป็นมาตรฐานเกือบทั้งหมด ควบคู่กับเงา **`shadow-sm`** ในสภาวะปกติ และขยับเป็น **`shadow-md`** พร้อมแสงสว่างรอบขอบเมื่อเอาเมาส์ไปชี้ (Hover)

---

## 1. Primary Action Button (ปุ่มหลักของหน้า)
*เช่น ปุ่ม "เพิ่มเพจใหม่", "บันทึกการแก้ไข"*
ปุ่มที่โดดเด่นที่สุดในจอ เพื่อดึงดูดสายตาและบอกผู้ใช้ว่า "นี่คือก้าวต่อไป"

- **Background:** `bg-[var(--primary-theme)]` (#2871df - Royal Blue)
- **Hover:** `hover:bg-[var(--primary-theme-hover)]` (#1e40af)
- **Text:** `text-white font-bold font-noto` 
- **ขนาด (Size):**
  - Standard Mode 1: `px-5 py-2.5` และมีขนาด Font เป็น `text-sm`
  - Compact Mode 2: `px-3 py-1.5` และมีขนาด Font เป็น `text-xs` (สำหรับหน้าข้อมูลเยอะ)
  - แบบเต็มความกว้าง: `w-full py-4`
- **ความโค้ง (Radius):** `rounded-2xl`
- **เงา (Shadow):** `shadow-lg shadow-blue-100/50` (ใช้เงาสะท้อนสีกรมท่าจางลง 50% จะดูละมุนและแพงที่สุด)
- **แอนิเมชัน:** `transition-all active:scale-95` (เด้งดึ๋งเมื่อกดยืนยัน)

## 2. Secondary Outline Button (ปุ่มรองแบบเว้นขอบ / ปุ่มไอคอน)
*เช่น ปุ่ม "ตั้งค่ากล่อง (ฟันเฟือง)", "ถังขยะ", "Import CSV"*
ปุ่มประกอบที่ไม่ได้สำคัญที่สุด แต่ต้องรักษาความหรูหราไว้

- **Background:** `bg-white` 
- **Border:** กั้นขอบบางๆ ด้วย `border border-slate-200`
- **Icon / Text Color:** สีปกติให้ใช้ `text-slate-500`
- **Hover State:** เมื่อเอาเมาส์ชี้ ให้เปลี่ยนไอคอนเป็นสีน้ำเงิน `hover:text-[var(--primary-theme)]` ควบคู่กับการเรืองแสงของขอบ `hover:border-[var(--primary-theme)]`
- **ขนาด / พื้นที่ (Padding):** ถ้าเป็นไอคอนล้วนๆ ให้ใช้ `p-3` (จะกลายเป็นกล่องจัตุรัสขนาดประมาณ 48x48px พอดีเป๊ะ)
- **ความโค้ง (Radius):** `rounded-2xl` (สำคัญมาก! เพื่อให้ล้อกับปุ่ม Primary)
- **เงา (Shadow):** ปกติปล่อยเงาจางๆ `shadow-sm` และตอนชี้ให้เงามันยืดออกมาเป็น `hover:shadow-md`

## 3. Toggle Control (สไลเดอร์สลับโหมด)
*เช่น ปุ่ม LayoutGrid vs Shield สลับโหมด Pages/Accounts*

- **Container (กล่องหลังสุด):**
  - **Background:** ไล่สี Gradient สวยงาม `bg-gradient-to-br from-[xxx] to-[xxx]` หรือสีพื้นเข้มสุด
  - **ความโค้ง / Padding:** `rounded-2xl p-1`
  - **เงา:** `shadow-lg border border-white/10` (ช่วยขับให้กล่องไม่แบน)
- **Indicator Pill (เม็ดแคปซูลขาวด้านในที่วิ่งไปมา):**
  - **Background:** `bg-white shadow-md`
  - **ความโค้ง:** เล็กลง 1 สเตปเพื่อให้ฟิตพอดีกับกล่องแม่ คือ `rounded-xl`
  - **ความกว้างแอนิเมชัน:** ใช้ `transition-all duration-300 ease-in-out` ในการเลื่อนพิกัด `left-xxx`

## 4. Input Field Design (ช่องกรอกข้อมูลหรือปฏิทิน)
*แถมคลาสมาตรฐานของช่องกรอกข้อมูลในหน้า Editor*

- **Background:** `bg-white`
- **Border:** `border border-slate-200`
- **ความโค้ง:** `rounded-2xl`
- **Padding:** `px-4 py-3.5` (ทำให้มีพื้นที่หายใจในช่องเยอะๆ)
- **Focus Behavior (ตอนคลิกพิมพ์):** `focus:ring-2 focus:ring-[var(--primary-theme)]/5 focus:border-[var(--primary-theme)]` (สีขอบเปลี่ยนเป็นสีน้ำเงิน และดันเกิดวงแหวนฟุ้งๆ บางๆ ล้อมรอบอีก 1 ชั้น)

## 5. Page Header (กฎเหล็กหัวข้อใหญ่หน้าจอ)
*ถอดรหัสระยะห่างและฟอนต์ทั้งหมดจากหน้า Facebook Page Setup เพื่อนำไปประยุกต์ให้ตรงกันทุกหน้า (Consistency)*
ส่วนนี้คือ "หัวใจ" ในการสื่อสารกับพนักงานว่ากำลังทำงานอยู่หน้าไหน การจัดเรียงฟอนต์และช่องไฟต้องเป๊ะระดับ Pixel-perfect

### 🧱 โครงสร้าง Skeleton Example (ก็อปลงไปใช้ได้เลย)
```tsx
<div className="flex justify-between items-center border-b border-slate-200 pt-4 pb-6 mb-6">
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
        PAGE TITLE
      </h2>
    </div>
    <p className="text-slate-400 font-noto text-[11px] mt-1.5">
      คำอธิบายหน้าจอแบบสั้นๆ • <span className="text-[var(--primary-theme)] font-bold">จุดเน้นข้อความ</span>
    </p>
  </div>
  
  {/* Action Buttons Container (ขวามือ) */}
  <div className="flex items-center gap-3">
    {/* ใส่ปุ่ม CSV, Toggle หรือ Date Picker ตรงนี้ (เน้นระยะห่าง py-2.5 หรือ h-[40px] เพื่อความเพรียวบาง) */}
  </div>
</div>
```

### 📏 สเปคคลาสที่ห้ามพลาด (The Absolute Rules)
- **Container Wrapper (กล่องหุ้มชั้นนอก):**
  - **กฎการดันขอบ (Margin & Padding):** ต้องใส่ `pt-4 pb-6 mb-6` เสมอ! 
    - `pt-4`: สำคัญมาก! คือการกดให้ชุดข้อความลงมาจากขอบจอบน 16px ซึ่งจะทำให้มันล้อไปกับระดับสายตาพอดี
    - `pb-6 mb-6`: สร้างพื้นที่หายใจให้เส้นตีเส้นบางๆ ด้านล่าง (`border-b border-slate-200`) ไม่ให้ชิดเนื้อหาเกินไป
  - **เลย์เอาต์:** ใช้ `flex justify-between items-center` เพื่อจับคำอธิบายกับกลุ่มปุ่มให้แยกซ้าย-ขวากันชัดเจน

- **Text Group (กลุ่มข้อความซ้ายมือ):**
  - ใช้ตระกร้า `flex flex-col gap-1` รัดเอาไว้

- **Title (หัวข้อหน้าใหญ่):**
  - `text-2xl font-bold` (ใช้มาตรฐานการอ่านแบบ 24px)
  - `text-[#0f172a]` (สีกรมท่าที่เข้มอมเทา ดูพรีเมียมและเป็นทางการกว่าสีดำสนิท #000000)
  - `font-outfit uppercase tracking-tight` (ฟอนต์ภาษาอังกฤษต้องบีบบริบทตัวอักษรให้ชิดเข้ากันนิดๆ)
  - `leading-none` (ลบระยะบรรทัดทิ้งไปเลย เพื่อไม่ให้กวนระยะห่างจริงที่เราจะเซ็ต)

- **Subtitle (คำอธิบายรองด้านล่าง):**
  - `text-[11px]` (จุดเปลี่ยนความสวยงาม! ไม่ใช้ font-xs ที่ 12px แต่ใช้ 11px จะดูละมุนและละเอียดกว่า)
  - `font-noto` (สำหรับภาษาไทย)
  - `mt-1.5` (ระยะดันหัวตัวอักษรไทยให้ห่างจากภาษาอังกฤษเป๊ะๆ 6px)
  - การเน้นข้อความในส่วนนี้ให้ใช้ `span` ครอบ แล้วย้อมสีน้ำเงินด้วย `text-[var(--primary-theme)] font-bold` เสมอ

---

### 🔥 สรุป Checklist (เอาไว้ไปตรวจสอบตรรกะ UI เวลารีวิว)
1. **โค้งมนเป๊ะไหม?** => ถ้าเป็นปุ่มแบบกล่องต้อง `rounded-2xl` เสมอ ห้ามตกไป `xl` หรือ `lg` เด็ดขาดยกเว้น Mode Compact
2. **ขอบปุ่ม Hover หรูไหม?** => ปุ่มรองทุกปุ่ม ต้องมี Hover ย้อมสีกรอบ `hover:border-[var(--primary-theme)]` และตัวหนังสือด้านใน
3. **เงาสะท้อนตรงสีไหม?** => ห้ามใช้ `shadow-lg` (สีดำ) เฉยๆ กับปุ่ม Primary สีน้ำเงิน ต้องห้อย `shadow-blue-100/50` เพื่อให้แสงละมุน
4. **คลิกแล้วรู้สึกตอบสนองไหม?** => ปุ่มที่เกิด Action หลัก ต้องมีคลาส `active:scale-95` ให้มันเด้งดึ๋งเล็กน้อยเมื่อถูกกดแรงๆ
5. **สีน้ำเงินถูกต้องไหม?** => ต้องใช้สีพื้นฐาน `#2871df` (Royal Blue) ผ่านตัวแปร `[var(--primary-theme)]` เท่านั้น ห้ามใช้ hardcoded blue-600/700 ในปุ่มงานสำคัญๆ

---

## 6. Page Container Standard (เกณฑ์การวางเลย์เอาต์หน้าจอ)
เพื่อให้ทุกหน้า "วางทับกันสนิท" (Aligned) และไม่มีปัญหาแถบเลื่อนแนวนอน (Horizontal Scroll) แม้จะใช้ Sidebar แบบ Fixed

- **คลาสมาตรฐานของ Container นอกสุด:** 
  `w-full max-w-[1600px] mx-auto flex flex-col gap-8 px-4 md:px-8 pb-10 animate-in fade-in duration-700`
- **เหตุผลที่ใช้ 1600px:** เป็นจุดสมดุลที่ดีที่สุดสำหรับจอ Wide Screen (1920px ขึ้นไป) ข้อมูลจะไม่กระจายจนกวาดสายตายาก และบนจอขนาดมาตรฐาน (1366px - 1440px) ตัวแอปจะแสดงผลเกือบเต็มจอ โดยมีพื้นที่หายใจ (Gutter) เล็กน้อย
- **การจัดการระยะ Sidebar:** ห้ามใช้ `ml-20` (Margin) ในตัว Main Wrapper ของแอป ให้ใช้ `pl-20` (Padding) แทน เพื่อไม่ให้ความกว้างของเนื้อหารวมกับ Margin แล้วล้น `100vw`
- **การป้องกันการล้น (Overflow):** ทุกหน้าควรมี `overflow-x-hidden` ในระดับ Container หลักเสมอ เพื่อประคองการไหลของเนื้อหาไม่ให้ไปดันขอบจอหลัก

---

## 7. Header Mode Standard (Modes 1 & 2)
- **Mode 1 (Standard):** สำหรับหน้าตั้งค่า, จัดการทีม, รายงาน (เว้นขอบบางด้านล่าง `border-b border-slate-200 pt-4 pb-6 mb-6`)
- **Mode 2 (High-Density):** สำหรับหน้า Operational Matrix ที่ต้องเห็นข้อมูลเยอะที่สุด (ลดระยะขอบลงครึ่งหนึ่ง)
