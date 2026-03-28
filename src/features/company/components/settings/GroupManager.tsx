'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Layers, 
  Edit3, 
  Save, 
  Target, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GroupDefinition, GroupPolicy } from '@/types';
import { useCompanyConfig } from '../../hooks/useCompanyConfig';
import { configService } from '@/services/configService';

export const GroupManager: React.FC = () => {
  const { config, saveGroup, deleteGroup, refreshConfig } = useCompanyConfig();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newGroup, setNewGroup] = useState<Partial<GroupDefinition & GroupPolicy>>({
    id: '',
    name: '',
    description: '',
    minPagesPerDay: 10,
    minClipsPerPage: 4
  });

  const handleSave = () => {
    if (!newGroup.id || !newGroup.name) return;

    const group: GroupDefinition = {
      id: newGroup.id,
      name: newGroup.name,
      description: newGroup.description,
      policy: {
        groupId: newGroup.id,
        minPagesPerDay: newGroup.minPagesPerDay || 10,
        minClipsPerPage: newGroup.minClipsPerPage || 4
      }
    };

    // Save Group
    saveGroup(group);
    
    // Also sync to legacy groupPolicies for backward compatibility
    const currentConfig = configService.getConfig();
    const updatedPolicies = [...(currentConfig.performancePolicy.groupPolicies || [])];
    const existingIdx = updatedPolicies.findIndex(p => p.groupId === group.id);
    
    if (existingIdx >= 0) {
      updatedPolicies[existingIdx] = group.policy;
    } else {
      updatedPolicies.push(group.policy);
    }

    configService.updateConfig({
      ...currentConfig,
      performancePolicy: {
        ...currentConfig.performancePolicy,
        groupPolicies: updatedPolicies
      }
    });

    refreshConfig();
    setIsAdding(false);
    setNewGroup({ id: '', name: '', description: '', minPagesPerDay: 10, minClipsPerPage: 4 });
  };

  const handleDelete = (id: string) => {
    deleteGroup(id);
    const currentConfig = configService.getConfig();
    configService.updateConfig({
      ...currentConfig,
      performancePolicy: {
        ...currentConfig.performancePolicy,
        groupPolicies: (currentConfig.performancePolicy.groupPolicies || []).filter(p => p.groupId !== id)
      }
    });
    refreshConfig();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-prompt">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-8">
        <div className="flex justify-between items-center font-outfit tracking-tight">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Organizational Groups</h3>
            <p className="text-slate-400 text-xs mt-1">Define departments and their unique operational targets.</p>
          </div>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-100"
            >
              <Plus size={18} /> Add New Group
            </button>
          )}
        </div>

        {isAdding && (
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Group ID (Internal)</label>
                <input 
                  value={newGroup.id}
                  onChange={(e) => setNewGroup({...newGroup, id: e.target.value})}
                  placeholder="e.g. News, Movies"
                  className="w-full bg-white border-none rounded-xl px-5 py-4 text-xs font-bold focus:ring-2 ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  placeholder="e.g. กลุ่มข่าว"
                  className="w-full bg-white border-none rounded-xl px-5 py-4 text-xs font-bold focus:ring-2 ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <input 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  placeholder="Brief summary of group responsibilities..."
                  className="w-full bg-white border-none rounded-xl px-5 py-4 text-xs font-bold focus:ring-2 ring-blue-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 pt-4 border-t border-slate-200">
                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Target size={14} /> Custom Submission Targets
                 </p>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-600 ml-1 font-prompt">จำนวนเพจขั้นต่ำ (หน้า/วัน)</label>
                       <input 
                         type="number"
                         value={newGroup.minPagesPerDay}
                         onChange={(e) => setNewGroup({...newGroup, minPagesPerDay: parseInt(e.target.value)})}
                         className="w-full bg-white border-none rounded-xl px-5 py-4 text-xs font-bold focus:ring-2 ring-blue-500 outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-slate-600 ml-1 font-prompt">จำนวนคลิปขั้นต่ำ (คลิป/เพจ)</label>
                       <input 
                         type="number"
                         value={newGroup.minClipsPerPage}
                         onChange={(e) => setNewGroup({...newGroup, minClipsPerPage: parseInt(e.target.value)})}
                         className="w-full bg-white border-none rounded-xl px-5 py-4 text-xs font-bold focus:ring-2 ring-blue-500 outline-none"
                       />
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
                className="bg-slate-900 text-white px-10 py-3 rounded-2xl text-xs font-bold hover:bg-black transition-all shadow-lg shadow-black/5 font-outfit tracking-tighter"
              >
                Register Operational Group
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.groups.map(group => {
            const groupPolicy = group.policy;
            return (
              <div key={group.id} className="group relative p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:border-blue-200 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                         <Layers size={22} />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800">{group.name}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.id}</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => handleDelete(group.id)}
                     className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>
                
                <p className="text-xs text-slate-500 mb-6 font-prompt leading-relaxed min-h-[2.5rem] italic">
                   {group.description || 'No description provided for this group.'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-white rounded-2xl border border-slate-50 text-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Min Pages</p>
                      <p className="text-sm font-black text-slate-700">{groupPolicy?.minPagesPerDay || config.performancePolicy.requiredPagesPerDay}</p>
                   </div>
                   <div className="p-3 bg-white rounded-2xl border border-slate-50 text-center">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Clips/Page</p>
                      <p className="text-sm font-black text-slate-700">{groupPolicy?.minClipsPerPage || config.performancePolicy.clipsPerPageInLog}</p>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
