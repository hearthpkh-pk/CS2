'use client';

import { PersonalTask } from '@/types';

const TASKS_KEY_PREFIX = 'hris_personal_tasks_';

/**
 * TaskService (Personal Task Layer)
 * Handles CRUD operations for user-specific to-do tasks.
 * Uses individual localStorage keys per user for data isolation.
 */
export const taskService = {
  /**
   * Fetch all tasks for a specific user.
   */
  getTasks(userId: string): PersonalTask[] {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(`${TASKS_KEY_PREFIX}${userId}`);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse personal tasks', e);
      return [];
    }
  },

  /**
   * Save (Create or Update) a task.
   */
  saveTask(userId: string, task: PersonalTask): void {
    const tasks = this.getTasks(userId);
    const index = tasks.findIndex(t => t.id === task.id);
    
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.unshift(task); // New tasks at top
    }
    
    this._persist(userId, tasks);
  },

  /**
   * Delete a specific task.
   */
  deleteTask(userId: string, taskId: string): void {
    const tasks = this.getTasks(userId);
    const updated = tasks.filter(t => t.id !== taskId);
    this._persist(userId, updated);
  },

  /**
   * Internal persistence helper.
   */
  _persist(userId: string, tasks: PersonalTask[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${TASKS_KEY_PREFIX}${userId}`, JSON.stringify(tasks));
  }
};
