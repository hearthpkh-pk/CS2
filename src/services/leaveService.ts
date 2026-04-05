import { LeaveRequest, LeaveType } from '@/types';
import { supabase } from '@/lib/supabaseClient';

/**
 * LeaveService (Supabase Data Layer)
 * 
 * Handles CRUD for leave records.
 * Uses public.leave_requests table in Supabase.
 */
export const leaveService = {

  getLeaves: async (userId?: string): Promise<LeaveRequest[]> => {
    let query = supabase.from('leave_requests').select('*').order('start_date', { ascending: false });
    
    // ถ้ามีการระบุ userId ค่อยฟิลเตอร์ ถ้าไม่ระบุ (เช่น Super Admin โหลดทั้งหมด) RLS จะทำงานดักให้เอง
    if (userId) {
      query = query.eq('staff_id', userId);
    }
    
    const { data: leaves, error } = await query;

    if (error) {
      console.error('Error fetching leaves:', error);
      return [];
    }

    return (leaves || []).map(l => ({
      id: l.id,
      staffId: l.staff_id,
      staffName: l.staff_id, // TODO: เรายังไม่ได้ join กับ profile 
      startDate: l.start_date,
      endDate: l.end_date,
      type: l.type,
      reason: l.reason,
      status: l.is_cancelled ? 'Cancelled' : 'Recorded',
      createdAt: l.created_at,
    }));
  },

  createLeave: async (userId: string, leave: {
    startDate: string;
    endDate: string;
    reason: string;
    type?: LeaveType;
    totalDays: number;
  }): Promise<void> => {
    const { error } = await supabase.from('leave_requests').insert({
      staff_id: userId,
      type: leave.type || 'Personal',
      start_date: leave.startDate.split('T')[0], // Extract just the date part (YYYY-MM-DD)
      end_date: leave.endDate.split('T')[0],
      total_days: leave.totalDays,
      reason: leave.reason,
      is_cancelled: false
    });

    if (error) {
      console.error('Error creating leave:', error);
      throw error;
    }
  },

  deleteLeave: async (userId: string, leaveId: string): Promise<void> => {
    // ตาม Business Rule ใหม่: สั่งลบไม่ได้ถ้าไม่ใช่ Super Admin 
    // แต่ "ยกเลิก" ใบลาตัวเองได้ (update is_cancelled = true)
    const { error } = await supabase.from('leave_requests')
      .update({ is_cancelled: true })
      .eq('id', leaveId)
      .eq('staff_id', userId);

    if (error) {
      console.error('Error cancelling leave:', error);
      throw error;
    }
  }
};
