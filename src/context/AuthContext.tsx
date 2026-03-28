'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '@/types';

interface AuthContextType {
  user: User | null;
  originalRole: Role | null;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
  switchPerspective: (user: User) => void;
  restoreOriginalRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalRole, setOriginalRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('cs2_user_session');
    const savedOrig = localStorage.getItem('cs2_original_role');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('cs2_user_session');
      }
    }
    
    if (savedOrig) {
      setOriginalRole(savedOrig as Role);
    }
    
    setIsLoading(false);
  }, []);

  const login = (role: Role) => {
    const roleId = role === Role.Developer ? '00' : role === Role.SuperAdmin ? '01' : '99';
    const mockUser: User = {
      id: `usr-${roleId}`,
      email: `${role.toLowerCase().replace(' ', '_')}@cs2.com`,
      username: role.toLowerCase().replace(' ', '_'),
      name: role === Role.Developer ? 'System Developer' : role === Role.SuperAdmin ? 'Executive Director' : 'Operational Staff',
      role,
      isActive: true,
      permissions: ['all'],
      startDate: new Date().toISOString().split('T')[0],
      salary: role === Role.Developer ? 120000 : 85000,
    };
    
    setUser(mockUser);
    setOriginalRole(role);
    localStorage.setItem('cs2_user_session', JSON.stringify(mockUser));
    localStorage.setItem('cs2_original_role', role);
  };

  const switchPerspective = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('cs2_user_session', JSON.stringify(newUser));
  };

  const restoreOriginalRole = () => {
    if (originalRole) {
      login(originalRole);
    }
  };

  const logout = () => {
    setUser(null);
    setOriginalRole(null);
    localStorage.removeItem('cs2_user_session');
    localStorage.removeItem('cs2_original_role');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        {/* Spinner */}
        <div className="animate-spin text-blue-500">
           <svg className="w-8 h-8" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
           </svg>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      originalRole, 
      isAuthenticated: !!user, 
      login, 
      logout,
      switchPerspective,
      restoreOriginalRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
