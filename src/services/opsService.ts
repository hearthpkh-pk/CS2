import { REVENUE_CONFIG } from '../constants/hrConfig';
import { DailyLog } from '../types';

/**
 * Operations Service
 * 
 * รับผิดชอบการนับวันทำงาน, ตรวจสอบการส่งงาน (Links), และวันหยุด
 */

export const OpsService = {
  /**
   * ตรวจสอบว่าในวันที่กำหนด มีการส่งงานครบตามโควตาหรือไม่
   * @param logs รายการ Log ของพนักงานในวันนั้น
   * @param requiredPages จำนวนเพจขั้นต่ำ (ปกติ 10)
   * @param clipsPerPage จำนวนคลิปต่อเพจ (ปกติ 4)
   */
  isWorkComplete(logs: DailyLog[], requiredPages: number = 10, clipsPerPage: number = 4): boolean {
    if (logs.length === 0) return false;

    // นับจำนวนเพจที่ไม่ซ้ำกันที่มีการส่งงาน
    const uniquePages = new Set(logs.map(log => log.staffId)); // ในที่นี้ staffId อาจถูกใช้แทน page identification ใน mock
    // หมายเหตุ: ในระบบจริงควรใช้ pageId จาก DailyLog
    
    // ตรวจสอบจำนวนเพจ
    if (uniquePages.size < requiredPages) return false;

    // ตรวจสอบจำนวนคลิป (ใน 1 log อาจจะเก็บจำนวนคลิปมาเลย หรือ 1 log = 1 คลิป)
    // สมมติ 1 log entry = การส่งงาน 1 ครั้ง ถ้าส่งครบต้องมี 40 logs หรือ analytics ใน log บอกว่าครบ
    const totalClips = logs.length; // แก้ไขภายหลังเมื่อปรับโครงสร้าง DailyLog
    
    return totalClips >= (requiredPages * clipsPerPage);
  },

  /**
   * นับจำนวนวันทำงานสะสมในเดือน
   */
  countWorkingDays(logs: DailyLog[]): number {
    const uniqueDates = new Set(logs.map(log => {
      // ดึงแค่วันที่จาก ISO string
      return new Date(log.createdAt || '').toDateString();
    }));
    
    return uniqueDates.size;
  },

  /**
   * ตรวจสอบวันหยุด (Mocked)
   */
  isHoliday(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // เสาร์-อาทิตย์เป็นวันหยุด (ตัวอย่าง)
  }
};
