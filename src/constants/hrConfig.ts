/**
 * Revenue & Commission Configuration Constants
 * 
 * เก็บค่าคงที่สำหรับการคำนวณผลงาน (Commission), อินเซนทีฟ (Incentive), 
 * และอัตราแลกเปลี่ยน เพื่อให้ระบบมีความแม่นยำและแก้ไขได้จากที่เดียว
 */

export const REVENUE_CONFIG = {
  // --- Commission & Incentive Rates ---
  RATES: {
    PER_VIEW: 0.0001,        // ตัวอย่าง: บาทต่อวิว
    PER_FOLLOWER: 0.1,      // ตัวอย่าง: บาทต่อผู้ติดตามใหม่
    MIN_MONTHLY_TARGET: 1000 // เป้าหมายขั้นต่ำ (THB)
  },

  // --- Working Day Rules ---
  WORK_RULES: {
    HOLIDAY_2X_PAY: 2.0,    // ค่าแรง/อินเซนทีฟ 2 แรงสำหรับวันหยุด
    MIN_LOGS_PER_DAY: 1     // จำนวนการส่งงานขั้นต่ำเพื่อนับเป็น 1 วันทำงาน
  },

  // --- Currency Conversion ---
  CURRENCY: {
    BASE_EXCHANGE_RATE: 35.5, // THB to 1 USD (เรทอ้างอิงเบื้องต้น)
    DECIMAL_PRECISION: 2      // จำนวนทศนิยมของ USD (ใช้ปัดเศษ Ceiling)
  }
};
