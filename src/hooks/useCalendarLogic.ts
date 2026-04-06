'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { User, PersonalTask, LeaveRequest, LeaveType, Role } from '@/types';
import { useCompanyConfig } from '@/features/company/hooks/useCompanyConfig';
import { holidayService } from '@/services/holidayService';
import { taskService } from '@/services/taskService';
import { leaveService } from '@/services/leaveService';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';

/**
 * useCalendarLogic
 * 
 * Encapsulates ALL business logic for the Calendar & Leave module.
 * CalendarView.tsx should ONLY handle rendering.
 * 
 * Sections:
 * 1. Calendar navigation (viewDate, selectedDate, prevMonth, nextMonth)
 * 2. Task CRUD (tasks, addTask, toggleTask, deleteTask)
 * 3. Leave CRUD (leaves, recordLeave, deleteLeave)
 * 4. Derived data (calendarDays, holidays, isTaskOnDay, getLeaveForDay)
 */
export function useCalendarLogic(currentUser: User) {
  const { config } = useCompanyConfig();

  // ─── 1. Calendar Navigation ───
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const prevMonth = useCallback(() => setViewDate(v => subMonths(v, 1)), []);
  const nextMonth = useCallback(() => setViewDate(v => addMonths(v, 1)), []);
  const goToToday = useCallback(() => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  }, []);

  // ─── 2. Task CRUD ───
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    setTasks(taskService.getTasks(currentUser.id));
  }, [currentUser.id]);

  const addTask = useCallback((title: string) => {
    if (!title.trim()) return;
    const newTask: PersonalTask = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    taskService.saveTask(currentUser.id, newTask);
    setTasks(taskService.getTasks(currentUser.id));
  }, [currentUser.id]);

  const toggleTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      taskService.saveTask(currentUser.id, { ...task, completed: !task.completed });
      setTasks(taskService.getTasks(currentUser.id));
    }
  }, [currentUser.id, tasks]);

  const updateTask = useCallback((updatedTask: PersonalTask) => {
    taskService.saveTask(currentUser.id, updatedTask);
    setTasks(taskService.getTasks(currentUser.id));
  }, [currentUser.id]);

  const deleteTask = useCallback((taskId: string) => {
    taskService.deleteTask(currentUser.id, taskId);
    setTasks(taskService.getTasks(currentUser.id));
  }, [currentUser.id]);

  /**
   * Check if a task falls on a specific day.
   * Tasks without startDate are "general" — not day-specific.
   */
  const isTaskOnDay = useCallback((task: PersonalTask, day: Date): boolean => {
    if (!task.startDate) return false;
    const start = startOfDay(new Date(task.startDate));
    const end = task.endDate ? endOfDay(new Date(task.endDate)) : endOfDay(start);
    return isWithinInterval(day, { start, end });
  }, []);

  // ─── 3. Leave CRUD ───
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const isElevatedRole = currentUser.role === Role.SuperAdmin || currentUser.role === Role.Admin || currentUser.role === Role.Developer;

  useEffect(() => {
    const fetchLeaves = async () => {
      // 🛡️ Super Admin/Admin เห็นใบลาพนักงานทั้งหมด, Staff เห็นแค่ของตนเอง
      const userId = isElevatedRole ? undefined : currentUser.id;
      setLeaves(await leaveService.getLeaves(userId));
    };
    fetchLeaves();
  }, [currentUser.id, isElevatedRole]);

  const recordLeave = useCallback(async (reason: string, date: Date, type?: LeaveType) => {
    // 🛡️ Block Backdated Leave (ลาย้อนหลัง)
    // สำหรับพนักงานทั่วไป ห้ามลาย้อนหลัง (วันที่เลือกต้องตั้งแต่วันนี้เป็นต้นไป)
    const today = startOfDay(new Date());
    const selectedDate = startOfDay(date);
    
    if (selectedDate < today && !isElevatedRole) {
      const errorMsg = "ห้ามทำรายการลาย้อนหลัง กรุณาแจ้ง Admin หากมีความจำเป็นเร่งด่วน";
      alert(errorMsg);
      throw new Error(errorMsg);
    }

    // 🛡️ Timezone-safe: ใช้ format() แทน toISOString() เพื่อป้องกัน UTC shift
    const localDateStr = format(date, 'yyyy-MM-dd');
    await leaveService.createLeave(currentUser.id, {
      startDate: localDateStr,
      endDate: localDateStr,
      reason,
      type,
      totalDays: 1
    });
    const userId = isElevatedRole ? undefined : currentUser.id;
    setLeaves(await leaveService.getLeaves(userId));
  }, [currentUser.id, isElevatedRole]);

  const deleteLeave = useCallback(async (leaveId: string) => {
    await leaveService.deleteLeave(currentUser.id, leaveId);
    const userId = isElevatedRole ? undefined : currentUser.id;
    setLeaves(await leaveService.getLeaves(userId));
  }, [currentUser.id, isElevatedRole]);

  /**
   * Find ALL leave records for a specific day (supports multiple staff leaves)
   * Super Admin จะเห็นหลายใบลาในวันเดียวกัน
   */
  const getLeavesForDay = useCallback((day: Date): LeaveRequest[] => {
    return leaves.filter(l => {
      // 🛡️ Timezone-safe parsing: split "YYYY-MM-DD" instead of new Date("...") 
      // to avoid UTC interpretation which causes off-by-one in UTC+7
      const [sy, sm, sd] = l.startDate.split('-').map(Number);
      const [ey, em, ed] = l.endDate.split('-').map(Number);
      const s = new Date(sy, sm - 1, sd, 0, 0, 0, 0);   // Local midnight start
      const e = new Date(ey, em - 1, ed, 23, 59, 59, 999); // Local end-of-day
      const d = new Date(day); d.setHours(12, 0, 0, 0);  // Local noon (safe midpoint)
      return d >= s && d <= e;
    });
  }, [leaves]);

  // ─── 4. Derived Data ───
  const monthStart = startOfMonth(viewDate);
  const calendarDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(monthStart),
      end: endOfWeek(endOfMonth(monthStart)),
    });
  }, [monthStart]);

  const weekDayNamesThai = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

  const selectedHoliday = useMemo(
    () => holidayService.getHoliday(selectedDate, config.holidays),
    [selectedDate, config.holidays]
  );

  const monthHolidays = useMemo(() => {
    return (config.holidays || []).filter(h => {
      const hDate = new Date(
        h.isRecurring ? `${viewDate.getFullYear()}-${h.date}` : h.date
      );
      return isSameMonth(hDate, viewDate);
    });
  }, [config.holidays, viewDate]);

  return {
    // Calendar navigation
    viewDate,
    selectedDate,
    setSelectedDate,
    prevMonth,
    nextMonth,
    goToToday,

    // Calendar grid data
    calendarDays,
    monthStart,
    weekDayNamesThai,
    selectedHoliday,
    monthHolidays,
    config,

    // Task operations
    tasks,
    newTaskTitle,
    setNewTaskTitle,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    isTaskOnDay,

    // Leave operations
    leaves,
    recordLeave,
    deleteLeave,
    getLeavesForDay,
  };
}
