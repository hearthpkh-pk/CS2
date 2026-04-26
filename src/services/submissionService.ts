'use client';

import { supabase } from '@/lib/supabaseClient';
import { MonthlySubmission, SubmissionPage, SubmissionStatus, Page, DailyLog } from '@/types';

/**
 * submissionService — ระบบส่งเช็คยอดประจำเดือน
 * 
 * Flow: Staff เลือกเพจ → Snapshot ยอดอัตโนมัติ → ส่ง → Admin Review → Approve/Reject
 * 
 * 🛡️ Design Decisions:
 * 1. Snapshot Lock: ยอดถูกเก็บ ณ ตอนส่ง ป้องกันการแก้ไขย้อนหลัง
 * 2. UNIQUE(staff_id, period): ส่งซ้ำเดือนเดียวกันไม่ได้ (ต้อง reject ก่อน)
 * 3. Commission คำนวณอัตโนมัติ แต่ Admin แก้ไขได้
 */
class SubmissionService {

  /**
   * ดึงยอดรวมของเพจในเดือนที่เลือก สำหรับทำ snapshot
   * คำนวณจาก DailyLog ที่มีอยู่ในระบบ
   */
  calculatePageSnapshot(
    pageId: string,
    period: string, // 'YYYY-MM'
    logs: DailyLog[]
  ): { views: number } {
    const [year, month] = period.split('-');
    
    const monthLogs = logs.filter(l => {
      const parts = l.date.split('-');
      return l.pageId === pageId && parts[0] === year && parts[1] === month;
    });

    const views = monthLogs.reduce((sum, l) => sum + Math.floor(Number(l.views || 0)), 0);

    return { views };
  }

  /**
   * สร้าง submission ใหม่ (Draft → Submitted)
   * พนักงานเลือกเพจ + snapshot ยอดอัตโนมัติ
   */
  async createSubmission(
    staffId: string,
    period: string,
    selectedPages: Page[],
    logs: DailyLog[],
    submittedByName?: string
  ): Promise<{ success: boolean; error?: string; data?: MonthlySubmission }> {
    try {
      // 🛡️ เช็คว่าเดือนนี้ส่งไปแล้วหรือยัง (ต้องไม่มี Submitted/Approved อยู่)
      const { data: existing } = await supabase
        .from('monthly_submissions')
        .select('id, status')
        .eq('staff_id', staffId)
        .eq('period', period)
        .in('status', ['Submitted', 'Approved'])
        .maybeSingle();

      if (existing) {
        return { 
          success: false, 
          error: existing.status === 'Approved' 
            ? 'เดือนนี้ได้รับการอนุมัติแล้ว' 
            : 'เดือนนี้ส่งเช็คยอดไปแล้ว กรุณารอ Admin ตรวจสอบ'
        };
      }

      // ลบ Draft/Rejected เก่า (ถ้ามี) เพื่อสร้างใหม่
      await supabase
        .from('monthly_submissions')
        .delete()
        .eq('staff_id', staffId)
        .eq('period', period)
        .in('status', ['Draft', 'Rejected']);

      // สร้าง Submission หลัก
      let totalViews = 0;

      const submissionPages: Array<{
        page_id: string;
        page_name: string;
        page_url?: string;
        page_status: string;
        snapshot_views: number;
      }> = [];

      for (const page of selectedPages) {
        const snapshot = this.calculatePageSnapshot(page.id, period, logs);
        totalViews += snapshot.views;

        submissionPages.push({
          page_id: page.id,
          page_name: page.name,
          page_url: page.url,
          page_status: page.status || 'Active',
          snapshot_views: snapshot.views,
        });
      }

      // Insert submission
      const { data: submission, error: subError } = await supabase
        .from('monthly_submissions')
        .insert({
          staff_id: staffId,
          period,
          status: 'Submitted',
          submitted_at: new Date().toISOString(),
          submitted_by_name: submittedByName || null,
          total_views: totalViews,
        })
        .select()
        .single();

      if (subError) throw subError;

      // Insert submission pages
      const pagesWithSubmissionId = submissionPages.map(p => ({
        ...p,
        submission_id: submission.id,
      }));

      const { error: pagesError } = await supabase
        .from('submission_pages')
        .insert(pagesWithSubmissionId);

      if (pagesError) throw pagesError;

      return {
        success: true,
        data: this.mapToSubmission(submission, []),
      };
    } catch (error: any) {
      console.error('❌ Failed to create submission:', error);
      return { success: false, error: error.message || 'เกิดข้อผิดพลาด' };
    }
  }

  /**
   * ดึง submission ของพนักงานคนนั้นสำหรับเดือนที่เลือก
   */
  async getMySubmission(staffId: string, period: string): Promise<MonthlySubmission | null> {
    try {
      const { data, error } = await supabase
        .from('monthly_submissions')
        .select(`
          *,
          submission_pages(*)
        `)
        .eq('staff_id', staffId)
        .eq('period', period)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const sub = this.mapToSubmission(data, data.submission_pages || []);
      
      // ดึง URL ของเพจที่ยังไม่มีใน Snapshot (Fallback สำหรับข้อมูลเก่า)
      const missingUrlPageIds = sub.pages.filter(p => !p.pageUrl).map(p => p.pageId);
      if (missingUrlPageIds.length > 0) {
        const { data: pages } = await supabase
          .from('pages')
          .select('id, url')
          .in('id', missingUrlPageIds);
          
        if (pages) {
          const urlMap = new Map(pages.map(p => [p.id, p.url]));
          sub.pages = sub.pages.map(p => ({
            ...p,
            pageUrl: p.pageUrl || urlMap.get(p.pageId)
          }));
        }
      }

      return sub;
    } catch (error) {
      console.error('Failed to get submission:', error);
      return null;
    }
  }

  /**
   * [Admin] ดึง submissions ทั้งหมดของเดือนที่เลือก
   */
  async getAllSubmissions(period: string): Promise<MonthlySubmission[]> {
    try {
      const { data, error } = await supabase
        .from('monthly_submissions')
        .select(`
          *,
          submission_pages(*)
        `)
        .eq('period', period)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      // Fetch staff names
      const staffIds = [...new Set(data.map(s => s.staff_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', staffIds);

      const nameMap = new Map(profiles?.map(p => [p.id, p.name]) || []);

      // Fetch page URLs for pages missing them in snapshot
      const allPageIds = [...new Set(data.flatMap(s => s.submission_pages?.map((p: any) => p.page_id) || []))];
      const { data: pages } = await supabase
        .from('pages')
        .select('id, url')
        .in('id', allPageIds);
        
      const urlMap = new Map(pages?.map(p => [p.id, p.url]) || []);

      return data.map(s => {
        const mappedSub = this.mapToSubmission(s, s.submission_pages || []);
        mappedSub.pages = mappedSub.pages.map(p => ({
          ...p,
          pageUrl: p.pageUrl || urlMap.get(p.pageId)
        }));
        
        return {
          ...mappedSub,
          staffName: nameMap.get(s.staff_id) || 'Unknown',
        };
      });
    } catch (error) {
      console.error('Failed to get all submissions:', error);
      return [];
    }
  }

  /**
   * [Admin] ดึงจำนวนรายการที่รอตรวจ
   */
  async getPendingCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('monthly_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Submitted');
      
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Failed to get pending count:', error);
      return 0;
    }
  }

  /**
   * [Admin] Approve submission + คำนวณค่าคอม
   */
  async approveSubmission(
    submissionId: string,
    reviewerId: string,
    calculatedCommission: number,
    adjustedCommission?: number,
    commissionNote?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('monthly_submissions')
        .update({
          status: 'Approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          calculated_commission: calculatedCommission,
          adjusted_commission: adjustedCommission ?? null,
          commission_note: commissionNote ?? null,
        })
        .eq('id', submissionId)
        .eq('status', 'Submitted'); // 🛡️ ป้องกัน approve ซ้ำ

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * [Admin] Reject submission + หมายเหตุ
   */
  async rejectSubmission(
    submissionId: string,
    reviewerId: string,
    reviewNote: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('monthly_submissions')
        .update({
          status: 'Rejected',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_note: reviewNote,
        })
        .eq('id', submissionId)
        .eq('status', 'Submitted');

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * [Admin] อัปเดตสถานะการตรวจเฉพาะเพจ
   */
  async updatePageReview(
    submissionPageId: string,
    status: 'Pending' | 'Approved' | 'Rejected',
    note?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('submission_pages')
        .update({
          review_status: status,
          review_note: note || null,
        })
        .eq('id', submissionPageId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Map Supabase row → TypeScript MonthlySubmission
   */
  private mapToSubmission(row: any, pages: any[]): MonthlySubmission {
    return {
      id: row.id,
      staffId: row.staff_id,
      staffName: row.staff_name,
      period: row.period,
      status: row.status as SubmissionStatus,
      submittedAt: row.submitted_at,
      submittedByName: row.submitted_by_name,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      reviewNote: row.review_note,
      totalViews: Number(row.total_views || 0),
      calculatedCommission: row.calculated_commission ? Number(row.calculated_commission) : undefined,
      adjustedCommission: row.adjusted_commission ? Number(row.adjusted_commission) : undefined,
      commissionNote: row.commission_note,
      pages: pages.map(p => ({
        id: p.id,
        submissionId: p.submission_id,
        pageId: p.page_id,
        pageName: p.page_name,
        pageUrl: p.page_url,
        pageStatus: p.page_status,
        reviewStatus: p.review_status || 'Pending',
        reviewNote: p.review_note,
        snapshotViews: Number(p.snapshot_views || 0),
        createdAt: p.created_at,
      })),
      createdAt: row.created_at,
    };
  }
}

export const submissionService = new SubmissionService();
