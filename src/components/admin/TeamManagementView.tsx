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
    <div className="flex flex-col gap-10 p-10 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 font-outfit tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Database size={20} />
            </div>
            Team Management
          </h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Personnel & Unit Administration Hub
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "p-3 rounded-xl transition-all duration-300 relative group",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-100" 
                  : "text-slate-300 hover:text-blue-600"
              )}
            >
              <tab.icon size={20} />
              {activeTab === tab.id && (
                 <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                   {tab.label}
                 </span>
              )}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-100 mx-2"></div>
          <button 
            onClick={() => setEditingUser({ id: `user-${Date.now()}`, name: '', role: Role.Staff, username: '', isActive: true })}
            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <Plus size={20} />
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
