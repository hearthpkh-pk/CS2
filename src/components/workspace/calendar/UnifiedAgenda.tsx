'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { PersonalTask, LeaveRequest, Role, User } from '@/types';
import { cn } from '@/lib/utils';
import { ConfirmationModal } from '@/components/kanban/ConfirmationModal';

interface UnifiedAgendaProps {
  selectedDate: Date;
  viewDate: Date;
  selectedHoliday: any; // Ideally Holiday type
  monthHolidays: any[]; // Ideally Holiday[]
  tasks: PersonalTask[];
  addTask: (title: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  isTaskOnDay: (task: PersonalTask, day: Date) => boolean;
  onTaskClick: (task: PersonalTask) => void;
  leaves?: LeaveRequest[];
  getLeavesForDay?: (day: Date) => LeaveRequest[];
  onCancelLeave?: (leaveId: string) => void;
  currentUser?: User;
}

export const UnifiedAgenda: React.FC<UnifiedAgendaProps> = ({
  selectedDate,
  viewDate,
  selectedHoliday,
  monthHolidays,
  tasks,
  addTask,
  toggleTask,
  deleteTask,
  isTaskOnDay,
  onTaskClick,
  leaves = [],
  getLeavesForDay,
  onCancelLeave,
  currentUser,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<PersonalTask | null>(null);
  const [leaveToCancel, setLeaveToCancel] = useState<LeaveRequest | null>(null);

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    }
  };

  const handleCancelLeaveConfirm = () => {
    if (leaveToCancel && onCancelLeave) {
      onCancelLeave(leaveToCancel.id);
      setLeaveToCancel(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'TASK', id: taskId }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col overflow-hidden transition-all duration-500 h-full max-h-[calc(100vh-200px)]">
      {/* ── Card Header ── */}
      <div className="px-8 pt-8 pb-6 border-b border-slate-50 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-outfit uppercase tracking-tight text-slate-900 leading-none">Agenda</h3>
            <p className="text-xs text-slate-400 mt-1 font-noto">
              {format(selectedDate, 'EEEE, d MMM yyyy')}
            </p>
          </div>
          <span className="text-xs text-slate-500">
            {tasks.filter(t => !t.completed).length} pending
          </span>
        </div>

        {/* Holiday Alert for selected date */}
        {selectedHoliday && (
          <div className="bg-rose-600 rounded-2xl px-5 py-3 flex items-center gap-3">
            <div>
              <p className="text-[10px] text-rose-200 uppercase tracking-wider leading-none">Public Holiday</p>
              <p className="text-sm text-white font-noto leading-tight mt-0.5">{selectedHoliday.name}</p>
            </div>
          </div>
        )}

        {/* Add task input */}
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!newTaskTitle.trim()) return;
          addTask(newTaskTitle);
          setNewTaskTitle('');
        }} className={cn("flex gap-2", selectedHoliday ? "mt-4" : "mt-0")}>
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="เพิ่มงาน..."
            className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-noto outline-none focus:ring-2 focus:ring-[var(--primary-theme)]/20 transition-all placeholder:text-slate-300"
          />
          <button type="submit" className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-black transition-all active:scale-95 shrink-0">
            <Plus size={18} />
          </button>
        </form>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50">

        {/* ── Section 1: Daily Plan (tasks that fall on selectedDate) ── */}
        <div className="px-8 py-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-noto">
            วันที่เลือก — {format(selectedDate, 'MMM d')}
          </p>
          {tasks.filter(t => isTaskOnDay(t, selectedDate)).length === 0 ? (
            <p className="text-sm text-slate-300 font-noto py-2">ไม่มีงานสำหรับวันนี้</p>
          ) : (
            <div className="space-y-1">
              {tasks.filter(t => isTaskOnDay(t, selectedDate)).map(task => (
                <div 
                  key={task.id} 
                  className="group flex items-center gap-3 py-2 cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <button onClick={() => toggleTask(task.id)} className="shrink-0">
                    {task.completed
                      ? <div className="bg-green-500 text-white rounded-full p-1"><CheckCircle2 size={14} /></div>
                      : <Circle size={20} className="text-slate-300 group-hover:text-[var(--primary-theme)] transition-colors" />}
                  </button>
                  <button 
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "flex-1 text-sm font-noto text-left outline-none cursor-pointer group-hover:text-slate-900", 
                      task.completed ? "line-through text-slate-300 group-hover:text-slate-400" : "text-slate-600"
                    )}
                  >
                    {task.title}
                    {task.startDate && (
                      <span className="block text-[11px] text-slate-400 font-outfit mt-0.5">
                        {format(new Date(task.startDate), 'MMM d')}
                        {task.endDate && ` — ${format(new Date(task.endDate), 'MMM d')}`}
                      </span>
                    )}
                  </button>
                  <button onClick={() => setTaskToDelete(task)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 1.5: Leaves ── */}
        <div className="px-8 py-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-noto">
            ลางาน — {format(selectedDate, 'MMM d')}
          </p>
          {(() => {
            const dayLeaves = getLeavesForDay ? getLeavesForDay(selectedDate) : [];
            if (dayLeaves.length === 0) return <p className="text-sm text-slate-300 font-noto py-2">ไม่มีผู้ลางานวันนี้</p>;
            
            return (
              <div className="space-y-2">
                {dayLeaves.map(leave => {
                  const isOwnLeave = leave.staffId === currentUser?.id;
                  const isElevatedRole = currentUser?.role === Role.SuperAdmin || currentUser?.role === Role.Admin || currentUser?.role === Role.Developer;
                  const canCancel = leave.status !== 'Cancelled' && (isOwnLeave || isElevatedRole);

                  return (
                    <div key={leave.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 gap-3">
                      <div className="flex-1 flex flex-col items-start min-w-0">
                        <div className="flex items-center gap-2 mb-1 max-w-full">
                           <span className={cn(
                             "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0",
                             leave.status === 'Cancelled' ? "bg-slate-200 text-slate-500" : "bg-blue-100 text-blue-700"
                           )}>
                             {leave.status === 'Cancelled' ? 'ยกเลิก' : 'ลาหยุด'}
                           </span>
                           <h4 className="font-bold text-sm text-slate-800 font-noto truncate">{leave.staffName}</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-noto truncate w-full">{leave.reason}</p>
                      </div>
                      
                      {canCancel && (
                        <button 
                          onClick={() => setLeaveToCancel(leave)}
                          className="shrink-0 p-2 text-rose-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm bg-white"
                          title="ยกเลิกใบลา"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* ── Section 2: All Tasks ── */}
        <div className="px-8 py-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-noto">งานทั้งหมด</p>
          {tasks.length === 0 ? (
            <p className="text-sm text-slate-300 font-noto py-2">ยังไม่มีงาน</p>
          ) : (
            <div className="space-y-1">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className="group flex items-center gap-3 py-2 cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <button onClick={() => toggleTask(task.id)} className="shrink-0">
                    {task.completed
                      ? <div className="bg-green-500 text-white rounded-full p-1"><CheckCircle2 size={14} /></div>
                      : <Circle size={20} className="text-slate-300 group-hover:text-[var(--primary-theme)] transition-colors" />}
                  </button>
                  <button 
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "flex-1 font-noto text-sm text-left outline-none cursor-pointer group-hover:text-slate-900", 
                      task.completed ? "line-through text-slate-300 group-hover:text-slate-400" : "text-slate-600"
                    )}
                  >
                    {task.title}
                    {!task.completed && task.startDate ? (
                      <span className="block text-[11px] text-slate-400 font-outfit mt-0.5">
                        {format(new Date(task.startDate), 'MMM d')}
                        {task.endDate && ` — ${format(new Date(task.endDate), 'MMM d')}`}
                      </span>
                    ) : !task.completed ? (
                      <span className="block text-[11px] text-slate-400 font-outfit mt-0.5">ไม่ระบุวัน</span>
                    ) : null}
                  </button>
                  <button onClick={() => setTaskToDelete(task)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section 3: This Month's Holidays ── */}
        <div className="px-8 py-5">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-4 font-noto">
            วันหยุด — {format(viewDate, 'MMMM yyyy')}
          </p>
          {monthHolidays.length === 0 ? (
            <p className="text-sm text-slate-300 font-noto py-2">ไม่มีวันหยุดในเดือนนี้</p>
          ) : (
            <div className="space-y-1">
              {monthHolidays.map(h => {
                const hDate = new Date(h.isRecurring
                  ? `${viewDate.getFullYear()}-${h.date}`
                  : h.date
                );
                return (
                  <div key={h.id} className="flex items-center gap-3 py-2">
                    <div className="bg-rose-600 text-white rounded-lg px-2.5 py-1 text-xs font-outfit tabular-nums shrink-0">
                      {format(hDate, 'dd')}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-600 font-noto leading-tight">{h.name}</span>
                      <span className="text-[11px] text-slate-400 font-outfit">
                        {format(hDate, 'EEEE')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!!taskToDelete && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setTaskToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="ลบงาน"
          message={`คุณต้องการลบงาน "${taskToDelete?.title}" ออกจากระบบใช่หรือไม่ การกระทำนี้ไม่สามารถย้อนกลับได้`}
          confirmLabel="ยืนยันการลบ"
          cancelLabel="ยกเลิก"
          variant="danger"
        />
      )}

      {!!leaveToCancel && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setLeaveToCancel(null)}
          onConfirm={handleCancelLeaveConfirm}
          title="ยกเลิกการลา"
          message={`คุณยืนยันที่จะยกเลิกใบลาของ "${leaveToCancel?.staffName || 'พนักงาน'}" สำหรับวันที่ ${format(selectedDate, 'EEEE, d MMM yyyy')} ใช่หรือไม่? (สามารถกดยืนยันด้วยปุ่ม Enter ได้ทันที)`}
          confirmLabel="ยืนยันยกเลิก"
          cancelLabel="กลับ"
          variant="warning"
        />
      )}
    </div>
  );
};
