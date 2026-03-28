'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Megaphone, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldAlert,
  Target,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Announcement, Role } from '@/types';
import { useCompanyConfig } from '../../hooks/useCompanyConfig';

export const AnnouncementManager: React.FC = () => {
  const { config, saveAnnouncement, deleteAnnouncement } = useCompanyConfig();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newAnn, setNewAnn] = useState<Partial<Announcement>>({
    message: '',
    type: 'info',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    targetRoles: [],
    targetGroups: [],
    targetTeams: [],
    targetUsers: []
  });

  const handleSave = () => {
    if (!newAnn.message) return;
    
    const announcement: Announcement = {
      id: `ann-${Date.now()}`,
      message: newAnn.message,
      type: (newAnn.type as any) || 'info',
      isActive: true,
      startDate: new Date(newAnn.startDate || Date.now()).toISOString(),
      endDate: newAnn.endDate ? new Date(newAnn.endDate).toISOString() : undefined,
      targetRoles: newAnn.targetRoles,
      targetGroups: newAnn.targetGroups,
      targetTeams: newAnn.targetTeams,
      targetUsers: newAnn.targetUsers
    };

    saveAnnouncement(announcement);
    setIsAdding(false);
    setNewAnn({
      message: '',
      type: 'info',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      targetRoles: [],
      targetGroups: [],
      targetTeams: [],
      targetUsers: []
    });
  };

  const toggleTarget = (field: keyof Announcement, value: any) => {
    const current = (newAnn[field] as any[]) || [];
    if (current.includes(value)) {
      setNewAnn({ ...newAnn, [field]: current.filter(v => v !== value) });
    } else {
      setNewAnn({ ...newAnn, [field]: [...current, value] });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-prompt">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
        <div className="flex justify-between items-center font-outfit tracking-tight">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Global Broadcaster</h3>
            <p className="text-slate-400 text-xs mt-1">Manage scrolling marquee announcements and system-wide alerts.</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-black/5"
            >
              <Plus size={18} /> New Broadcast
            </button>
          )}
        </div>

        {isAdding && (
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                <textarea 
                  value={newAnn.message}
                  onChange={(e) => setNewAnn({...newAnn, message: e.target.value})}
                  placeholder="พิมพ์ข้อความประกาศประกาศที่นี่..."
                  className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 ring-blue-500 outline-none h-24 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Alert Level</label>
                <div className="flex gap-2">
                   {['info', 'warning', 'critical'].map((type) => (
                     <button
                       key={type}
                       onClick={() => setNewAnn({...newAnn, type: type as any})}
                       className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        newAnn.type === type 
                          ? (type === 'critical' ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-100" : 
                             type === 'warning' ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100" : 
                             "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100")
                          : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                       )}
                     >
                        {type}
                     </button>
                   ))}
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Window</label>
                 <div className="flex gap-2 items-center">
                    <input 
                       type="date"
                       value={newAnn.startDate}
                       onChange={(e) => setNewAnn({...newAnn, startDate: e.target.value})}
                       className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-xs font-bold"
                    />
                    <span className="text-slate-300">to</span>
                    <input 
                       type="date"
                       value={newAnn.endDate || ''}
                       onChange={(e) => setNewAnn({...newAnn, endDate: e.target.value})}
                       className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-xs font-bold"
                    />
                 </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Target size={14} /> Targeting Logic (Optional)
               </label>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Role Target */}
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500">By Role</p>
                    <div className="flex flex-wrap gap-1">
                       {[Role.Admin, Role.Manager, Role.Staff, Role.SuperAdmin, Role.Developer].map(role => (
                         <button 
                           key={role}
                           onClick={() => toggleTarget('targetRoles', role)}
                           className={cn(
                             "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all",
                             newAnn.targetRoles?.includes(role) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100"
                           )}
                         >
                            {role}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Group Target */}
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500">By Group</p>
                    <div className="flex flex-wrap gap-1">
                       {config.groups.map(group => (
                         <button 
                           key={group.id}
                           onClick={() => toggleTarget('targetGroups', group.id)}
                           className={cn(
                             "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all",
                             newAnn.targetGroups?.includes(group.id) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100"
                           )}
                         >
                            {group.name}
                         </button>
                       ))}
                    </div>
                 </div>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all font-outfit"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-blue-600 text-white px-10 py-3 rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-outfit tracking-tighter"
              >
                Publish Live Broadcast
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Broadcasts Queue</p>
          {config.announcements.map(ann => (
            <div key={ann.id} className="group relative flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-100 transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                  ann.type === 'critical' ? "bg-rose-50 text-rose-500" : 
                  ann.type === 'warning' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                )}>
                  <Megaphone size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-tight">{ann.message}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={12} />
                        {ann.startDate ? new Date(ann.startDate).toLocaleDateString() : 'Immediate'} 
                        {ann.endDate ? ` - ${new Date(ann.endDate).toLocaleDateString()}` : ''}
                      </div>
                     {ann.targetRoles && ann.targetRoles.length > 0 && (
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                           <Users size={10} /> {ann.targetRoles.length} Roles
                        </span>
                     )}
                </div>
              </div>
              <button 
                onClick={() => deleteAnnouncement(ann.id)}
                className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {config.announcements.length === 0 && (
             <div className="text-center py-10 opacity-30 select-none grayscale invert space-y-2">
                <Megaphone size={40} className="mx-auto" />
                <p className="text-xs font-bold uppercase tracking-widest">No active broadcasts</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
