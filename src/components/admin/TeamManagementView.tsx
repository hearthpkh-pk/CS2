import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Map, 
  ShieldCheck, 
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Role, User } from '@/types';

// Refactored Sub-components
import StatCards from './team/StatCards';
import PersonnelTable from './team/PersonnelTable';
import UnitTopology from './team/UnitTopology';
import AccessMatrix from './team/AccessMatrix';
import PersonnelDrawer from './team/PersonnelDrawer';

// Logic & Data
import { useTeamManagement } from './team/useTeamManagement';

interface TeamManagementProps {
  users?: User[];
  setUsers?: (users: User[]) => void;
  currentUser?: User;
}

export const TeamManagementView: React.FC<TeamManagementProps> = ({
  users: externalUsers,
  setUsers: setExternalUsers,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'teams' | 'access'>('directory');
  
  const {
    users,
    teams,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    filteredUsers,
    stats,
    editingUser,
    setEditingUser,
    isAdjustingSalary,
    setIsAdjustingSalary,
    salaryForm,
    setSalaryForm,
    handleSaveUser,
    handleCreateTeam,
    handleUpdateTeam,
    handleDeleteTeam,
    handleConfirmSalary
  } = useTeamManagement([], [], externalUsers, setExternalUsers, currentUser?.role);

  const tabs = [
    { id: 'directory', label: 'Personnel Registry', icon: Users },
    { id: 'teams', label: 'Unit Topology', icon: Map },
    { id: 'access', label: 'Access Control', icon: ShieldCheck },
  ] as const;

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 px-4 md:px-8 pb-10 animate-in fade-in duration-700">
      
      {/* Page Header (Golden Rules Mode 1) */}
      <div className="flex justify-between items-center border-b border-slate-200 pt-4 pb-6 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#0f172a] font-outfit uppercase tracking-tight leading-none">
              TEAM MANAGEMENT
            </h2>
          </div>
          <p className="text-slate-400 font-noto text-[11px] mt-1.5">
            ระบบบริหารจัดการโครงสร้างและสิทธิ์การเข้าถึง • <span className="text-[var(--primary-theme)] font-bold">Admin Hub</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "p-2.5 rounded-2xl transition-all duration-300 relative group flex items-center justify-center border",
                  activeTab === tab.id 
                    ? "bg-[var(--primary-theme)] border-[var(--primary-theme)] text-white shadow-lg shadow-blue-100/50" 
                    : "bg-white border-slate-200 text-slate-400 hover:text-[var(--primary-theme)] hover:border-[var(--primary-theme)] shadow-sm"
                )}
              >
                <tab.icon size={18} />
                {activeTab === tab.id && (
                   <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                     {tab.label}
                   </span>
                )}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setEditingUser({ id: `user-${Date.now()}`, name: '', role: Role.Staff, username: '', isActive: true })}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-theme)] text-white text-sm font-bold font-noto rounded-2xl hover:bg-[var(--primary-theme-hover)] transition-all shadow-lg shadow-blue-100/50 active:scale-95"
          >
            <Plus size={18} />
            เพิ่มพนักงาน
          </button>
        </div>
      </div>

      {/* Conditionally Render Stat Cards (only for directory/teams) */}
      {activeTab !== 'access' && <StatCards stats={stats} />}

      {/* Main Content Areas */}
      <div className="min-h-[600px]">
        {activeTab === 'directory' && (
          <PersonnelTable 
            users={filteredUsers}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            onEdit={setEditingUser}
            teams={teams}
          />
        )}

        {activeTab === 'teams' && (
          <UnitTopology 
            teams={teams}
            users={users}
            onUpdateTeam={handleUpdateTeam}
            onCreateTeam={handleCreateTeam}
            onDeleteTeam={handleDeleteTeam}
          />
        )}

        {activeTab === 'access' && <AccessMatrix />}
      </div>

      {/* Profile Editor Drawer */}
      <PersonnelDrawer 
        editingUser={editingUser}
        users={users}
        teams={teams}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
        onChange={setEditingUser}
        isAdjustingSalary={isAdjustingSalary}
        onToggleAdjustSalary={setIsAdjustingSalary}
        salaryForm={salaryForm}
        onSalaryFormChange={setSalaryForm}
        onConfirmSalary={handleConfirmSalary}
        viewerRole={currentUser?.role}
      />

    </div>
  );
};
