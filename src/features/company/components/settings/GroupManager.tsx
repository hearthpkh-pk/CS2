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
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Star,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GroupDefinition, GroupPolicy } from '@/types';
import { useCompanyConfig } from '../../hooks/useCompanyConfig';
import { configService } from '@/services/configService';

export const GroupManager: React.FC = () => {
  const { config, saveGroup, deleteGroup, refreshConfig } = useCompanyConfig();
  const [isAdding, setIsAdding] = useState(false);
  
  const [newGroup, setNewGroup] = useState<Partial<GroupDefinition & GroupPolicy>>({
    id: '',
    name: '',
    description: '',
    minPagesPerDay: 10,
    minClipsPerPage: 4,
    isDefault: false
  });

  const handleSave = async () => {
    if (!newGroup.id || !newGroup.name) return;

    const group: GroupDefinition = {
      id: (newGroup.id || '').toUpperCase(),
      name: newGroup.name,
      description: newGroup.description,
      isDefault: newGroup.isDefault || false,
      policy: {
        groupId: (newGroup.id || '').toUpperCase(),
        minPagesPerDay: newGroup.minPagesPerDay || 10,
        minClipsPerPage: newGroup.minClipsPerPage || 4
      }
    };

    await saveGroup(group);
    
    // Sync to legacy groupPolicies
    const currentConfig = await configService.getConfig();
    const updatedPolicies = [...(currentConfig.performancePolicy.groupPolicies || [])];
    const existingIdx = updatedPolicies.findIndex(p => p.groupId === group.id);
    
    if (existingIdx >= 0) {
      updatedPolicies[existingIdx] = group.policy;
    } else {
      updatedPolicies.push(group.policy);
    }

    await configService.updateConfig({
      performancePolicy: {
        ...currentConfig.performancePolicy,
        groupPolicies: updatedPolicies
      }
    });

    refreshConfig();
    setIsAdding(false);
    setNewGroup({ id: '', name: '', description: '', minPagesPerDay: 10, minClipsPerPage: 4, isDefault: false });
  };

  const handleSetDefault = async (group: GroupDefinition) => {
    await saveGroup({ ...group, isDefault: true });
    refreshConfig();
  };

  const handleDelete = async (id: string) => {
    await deleteGroup(id);
    const currentConfig = await configService.getConfig();
    await configService.updateConfig({
      performancePolicy: {
        ...currentConfig.performancePolicy,
        groupPolicies: (currentConfig.performancePolicy.groupPolicies || []).filter(p => p.groupId !== id)
      }
    });
    refreshConfig();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 font-prompt">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-50 pb-6">
           <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800 font-outfit uppercase tracking-tight">Organizational Units</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-left">จัดการกลุ่มและเป้าหมายแยกตามเงื่อนไขแบรนด์</p>
           </div>
           {!isAdding && (
             <button 
               onClick={() => setIsAdding(true)}
               className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-sm"
             >
               <Plus size={18} />
             </button>
           )}
        </div>

        {isAdding && (
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ID (Internal)</label>
                  <input 
                    value={newGroup.id}
                    onChange={(e) => setNewGroup({...newGroup, id: e.target.value.toUpperCase()})}
                    placeholder="NEWS"
                    className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-blue-500/20 outline-none transition-all uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Group Name</label>
                  <input 
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                    placeholder="เช่น กลุ่มรายการ"
                    className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold focus:border-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Policy (Pages & Clips)</label>
                <div className="grid grid-cols-2 gap-4">
                   <div className="relative">
                      <input 
                        type="number"
                        value={newGroup.minPagesPerDay}
                        onChange={(e) => setNewGroup({...newGroup, minPagesPerDay: parseInt(e.target.value)})}
                        className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500/20 outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">Pages</span>
                   </div>
                   <div className="relative">
                      <input 
                        type="number"
                        value={newGroup.minClipsPerPage}
                        onChange={(e) => setNewGroup({...newGroup, minClipsPerPage: parseInt(e.target.value)})}
                        className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:border-blue-500/20 outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">Clips</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsAdding(false)} className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Discard</button>
              <button 
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all font-outfit"
              >
                Save Unit
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {config.groups.map(group => {
            const groupPolicy = group.policy;
            return (
              <div key={group.id} className="group relative p-6 bg-slate-50/30 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-100 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 font-outfit uppercase text-base tracking-tight">{group.name}</h4>
                        {group.isDefault && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Default</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{group.id}</span>
                         <span className="text-[11px] text-slate-400 font-medium tracking-tight truncate max-w-[150px]">{group.description || 'System Unit'}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all text-slate-300">
                      {!group.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(group)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Set default"
                        >
                          <Star size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(group.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:text-rose-500 hover:bg-rose-50 transition-all">
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-slate-600">
                   <div className="p-3 bg-white border border-slate-50 rounded-xl space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Limit</p>
                      <p className="text-base font-bold tabular-nums text-slate-900 font-outfit">
                        {groupPolicy?.minPagesPerDay} <span className="text-[9px] text-slate-300 font-bold ml-1 uppercase">Pages</span>
                      </p>
                   </div>
                   <div className="p-3 bg-white border border-slate-50 rounded-xl space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission</p>
                      <p className="text-base font-bold tabular-nums text-slate-900 font-outfit">
                        {groupPolicy?.minClipsPerPage} <span className="text-[9px] text-slate-300 font-bold ml-1 uppercase">Clips</span>
                      </p>
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
