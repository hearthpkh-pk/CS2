'use client';

import { LeaveRequest, LeaveType } from '@/types';

const LEAVES_KEY_PREFIX = 'hris_leave_requests_';

/**
 * LeaveService (Data Layer Only)
 * 
 * Handles CRUD for leave records. Pure data operations — no UI logic.
 * 
 * Business Rules:
 * - Leave is "Recorded" immediately when staff creates it (no approval gate).
 * - Data is forwarded to Super Admin for acknowledgment and payroll calculation.
 * - Dates are stored as ISO strings; startDate and endDate are inclusive.
 */
export const leaveService = {

  getLeaves(userId: string): LeaveRequest[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(`${LEAVES_KEY_PREFIX}${userId}`);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse leave requests', e);
      return [];
    }
  },

  /**
   * Record a new leave. Status is always 'Recorded' — no approval needed.
   */
  createLeave(userId: string, leave: {
    staffName: string;
    startDate: string;
    endDate: string;
    reason: string;
    type?: LeaveType;
  }): LeaveRequest {
    const newLeave: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      staffId: userId,
      staffName: leave.staffName,
      startDate: leave.startDate,
      endDate: leave.endDate,
      type: leave.type || 'Personal',
      reason: leave.reason,
      status: 'Recorded',
      createdAt: new Date().toISOString(),
    };

    const leaves = this.getLeaves(userId);
    leaves.unshift(newLeave);
    this._persist(userId, leaves);
    return newLeave;
  },

  /**
   * Check if a specific date has a leave record.
   */
  getLeaveOnDate(userId: string, date: Date): LeaveRequest | undefined {
    const leaves = this.getLeaves(userId);
    return leaves.find(l => {
      const start = new Date(l.startDate); start.setHours(0, 0, 0, 0);
      const end = new Date(l.endDate); end.setHours(23, 59, 59, 999);
      const d = new Date(date); d.setHours(12, 0, 0, 0);
      return d >= start && d <= end;
    });
  },

  /**
   * Get all leaves overlapping a given month.
   */
  getLeavesInMonth(userId: string, year: number, month: number): LeaveRequest[] {
    const leaves = this.getLeaves(userId);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return leaves.filter(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      return start <= monthEnd && end >= monthStart;
    });
  },

  deleteLeave(userId: string, leaveId: string): void {
    const leaves = this.getLeaves(userId);
    this._persist(userId, leaves.filter(l => l.id !== leaveId));
  },

  _persist(userId: string, leaves: LeaveRequest[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${LEAVES_KEY_PREFIX}${userId}`, JSON.stringify(leaves));
  }
};
