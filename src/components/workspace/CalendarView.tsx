'use client';

import React, { useState } from 'react';
import { User, PersonalTask, LeaveRequest } from '@/types';
import { useCalendarLogic } from '@/hooks/useCalendarLogic';
import { CalendarGrid } from './calendar/CalendarGrid';
import { UnifiedAgenda } from './calendar/UnifiedAgenda';
import { LeaveRequestModal } from './calendar/LeaveRequestModal';
import { TaskEditorDrawer } from './calendar/TaskEditorDrawer';

interface CalendarViewProps {
  currentUser: User;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ currentUser }) => {
  const {
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
  } = useCalendarLogic(currentUser);

  // local UI states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [editingTask, setEditingTask] = useState<PersonalTask | null>(null);

  const handleTaskDrop = (taskId: string, newDate: Date) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({
        ...task,
        startDate: newDate.toISOString(),
        endDate: newDate.toISOString()
      });
      setSelectedDate(newDate);
    }
  };

  // --- Render Helpers ---
  const renderHeader = () => (
    <div className="flex justify-between items-center border-b border-slate-200 pt-4 pb-6 mb-6 transition-all duration-500">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
            CALENDAR & LEAVE
          </h2>
        </div>
        <p className="text-slate-400 font-noto text-[11px] mt-1.5 flex items-center gap-2">
          ตารางบริหารจัดการเวลาและระบบลางานออนไลน์ • <span className="text-[var(--primary-theme)] font-bold">Premium Workspace</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-10 flex flex-col gap-8 animate-in fade-in duration-1000 min-h-screen">
      
      {/* 🏛️ STANDARDIZED PAGE HEADER */}
      {renderHeader()}

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* 📅 LEFT PANE: Balanced Calendar Center (70%) */}
        <div className="flex-1 flex flex-col gap-6">
           <CalendarGrid
              viewDate={viewDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              prevMonth={prevMonth}
              nextMonth={nextMonth}
              goToToday={goToToday}
              calendarDays={calendarDays}
              monthStart={monthStart}
              weekDayNamesThai={weekDayNamesThai}
              config={config}
              getLeavesForDay={getLeavesForDay}
              onAddLeaveClick={() => setShowLeaveModal(true)}
              tasks={tasks}
              isTaskOnDay={isTaskOnDay}
              onTaskClick={setEditingTask}
              onTaskDrop={handleTaskDrop}
           />
        </div>

        {/* 📋 RIGHT PANE: Unified Agenda & Tasks */}
        <div className="w-full xl:w-[400px] flex flex-col">
           <UnifiedAgenda
              selectedDate={selectedDate}
              viewDate={viewDate}
              selectedHoliday={selectedHoliday}
              monthHolidays={monthHolidays}
              tasks={tasks}
              addTask={addTask}
              toggleTask={toggleTask}
              deleteTask={deleteTask}
              isTaskOnDay={isTaskOnDay}
              onTaskClick={setEditingTask}
              leaves={leaves}
              getLeavesForDay={getLeavesForDay}
              onCancelLeave={deleteLeave}
              currentUser={currentUser}
           />
        </div>

      </div>

      {/* Overlays / Modals */}
      <LeaveRequestModal
         isOpen={showLeaveModal}
         onClose={() => setShowLeaveModal(false)}
         selectedDate={selectedDate}
         leaveReason={leaveReason}
         setLeaveReason={setLeaveReason}
         onConfirm={() => {
            recordLeave(leaveReason, selectedDate);
            setShowLeaveModal(false);
            setLeaveReason('');
         }}
      />

      <TaskEditorDrawer
         isOpen={!!editingTask}
         onClose={() => setEditingTask(null)}
         task={editingTask}
         onSave={updateTask}
      />
      
    </div>
  );
};
