'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { User, PersonalTask, LeaveRequest, LeaveType } from '@/types';
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

  useEffect(() => {
    setLeaves(leaveService.getLeaves(currentUser.id));
  }, [currentUser.id]);

  const recordLeave = useCallback((reason: string, date: Date, type?: LeaveType) => {
    leaveService.createLeave(currentUser.id, {
      staffName: currentUser.name,
      startDate: date.toISOString(),
      endDate: date.toISOString(),
      reason,
      type,
    });
    setLeaves(leaveService.getLeaves(currentUser.id));
  }, [currentUser.id, currentUser.name]);

  const deleteLeave = useCallback((leaveId: string) => {
    leaveService.deleteLeave(currentUser.id, leaveId);
    setLeaves(leaveService.getLeaves(currentUser.id));
  }, [currentUser.id]);

  /**
   * Find leave record for a specific day (used by calendar grid).
   */
  const getLeaveForDay = useCallback((day: Date): LeaveRequest | undefined => {
    return leaves.find(l => {
      const s = new Date(l.startDate); s.setHours(0, 0, 0, 0);
      const e = new Date(l.endDate); e.setHours(23, 59, 59, 999);
      const d = new Date(day); d.setHours(12, 0, 0, 0);
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
    deleteTask,
    isTaskOnDay,

    // Leave operations
    leaves,
    recordLeave,
    deleteLeave,
    getLeaveForDay,
  };
}
