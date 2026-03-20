import { REVENUE_CONFIG } from '../constants/hrConfig';

/**
 * Revenue Service
 * 
 * รับผิดชอบการคำนวณรายได้, ค่าคอมมิชชัน, และการแปลงสกุลเงิน
 * ตามกฎ "Total Fidelity" และห้ามมี Logic ปนกับ UI
 */

export interface PerformanceStats {
  monthlyViews: number;
  monthlyFollowers: number;
}

export const RevenueService = {
  /**
   * คำนวณค่าคอมมิชชันรายเดือนตามยอดวิว
   * @param views ยอดรวมวิวทั้งเดือนของพนักงาน
   * @returns จำนวนเงินคอมมิชชัน (THB)
   */
  calculateMonthlyCommission(views: number): number {
    const { RATES, WORK_RULES } = REVENUE_CONFIG;
    
    // Tier 0: Penalty (ต่ำกว่า 10 ล้านวิว)
    if (views < 10000000) {
      return -2000;
    }

    // Tier 2: Super Bonus (ตั้งแต่ 100 ล้านวิวขึ้นไป)
    if (views >= 100000000) {
      // 1,500 THB ทุกๆ 10M views
      return Math.floor(views / 10000000) * 1500;
    }

    // Tier 1: Standard (10M - 99M views)
    // 1,000 THB ทุกๆ 10M views
    return Math.floor(views / 10000000) * 1000;
  },

  /**
   * แปลงเงินบาทเป็น USD
   * @param thbAmount ยอดเงินบาท
   * @returns ยอดเงิน USD (ปัดทศนิยมขึ้น 2 ตำแหน่ง)
   */
  convertToUSD(thbAmount: number): number {
    const { CURRENCY } = REVENUE_CONFIG;
    if (thbAmount <= 0) return 0;
    
    const usd = thbAmount / CURRENCY.BASE_EXCHANGE_RATE;
    
    // ใช้ Math.ceil กับทศนิยม 2 ตำแหน่งเพื่อให้เงินไม่ขาด (ตามกฎ Precision)
    return Math.ceil(usd * 100) / 100;
  },

  /**
   * คำนวณรายได้สุทธิ (เงินเดือน + ค่าคอม/หัก)
   */
  calculateNetIncome(baseSalary: number, views: number): { thb: number; usd: number } {
    const commission = this.calculateMonthlyCommission(views);
    const netTHB = baseSalary + commission;
    
    return {
      thb: netTHB,
      usd: this.convertToUSD(netTHB)
    };
  }
};
