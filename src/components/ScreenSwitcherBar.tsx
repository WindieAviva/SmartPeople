import React, { useState } from 'react';
import { ScreenId, UserRole } from '../types';

interface ScreenSwitcherBarProps {
  currentScreen: ScreenId;
  currentRole: UserRole;
  onNavigate: (screen: ScreenId) => void;
  onChangeRole: (role: UserRole) => void;
}

export const ScreenSwitcherBar: React.FC<ScreenSwitcherBarProps> = ({
  currentScreen,
  currentRole,
  onNavigate,
  onChangeRole,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const screens: { id: ScreenId; label: string; role: UserRole; icon: string }[] = [
    { id: 'dashboard-lecturer', label: 'Dosen Dashboard', role: 'lecturer', icon: 'co_present' },
    { id: 'course-detail', label: 'Detail Matkul (TIF-204)', role: 'student', icon: 'auto_stories' },
    { id: 'dashboard-student', label: 'Mahasiswa Dashboard', role: 'student', icon: 'school' },
    { id: 'dashboard-admin', label: 'Admin Dashboard', role: 'admin', icon: 'admin_panel_settings' },
    { id: 'attendance-recap', label: 'Rekap Presensi', role: 'student', icon: 'fact_check' },
    { id: 'academic-roster', label: 'Academic Roster', role: 'lecturer', icon: 'group' },
    { id: 'course-catalog', label: 'Course Catalog', role: 'lecturer', icon: 'menu_book' },
    { id: 'gradebook', label: 'Gradebook OBE', role: 'lecturer', icon: 'assignment_turned_in' },
    { id: 'student-advising', label: 'Student Advising', role: 'lecturer', icon: 'psychology' },
    { id: 'class-schedules', label: 'Class Schedules', role: 'lecturer', icon: 'calendar_month' },
    { id: 'login', label: 'Halaman Login', role: 'student', icon: 'login' },
  ];

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 px-3.5 py-2 bg-primary text-on-primary rounded-full shadow-2xl hover:bg-primary-container text-xs font-bold border border-secondary/30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm text-tertiary-fixed">
            grid_view
          </span>
          <span>Buka Navigasi Layar (11 Layar)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] overflow-x-auto bg-primary/95 text-on-primary backdrop-blur-md px-3 py-2 rounded-2xl shadow-2xl border border-outline/30 flex items-center gap-1.5 scrollbar-none">
      <div className="flex items-center gap-1 pr-2 border-r border-outline/30 shrink-0">
        <span className="material-symbols-outlined text-tertiary-fixed text-base">
          layers
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary-fixed hidden md:inline">
          Layar:
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {screens.map((s) => {
          const isActive = currentScreen === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                onChangeRole(s.role);
                onNavigate(s.id);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-sm scale-105'
                  : 'hover:bg-primary-container text-on-primary-container hover:text-on-primary'
              }`}
              title={s.label}
            >
              <span className="material-symbols-outlined text-sm">{s.icon}</span>
              <span className="hidden xl:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setCollapsed(true)}
        className="p-1 hover:bg-primary-container rounded-full text-on-primary-container hover:text-on-primary ml-1 shrink-0 cursor-pointer"
        title="Sembunyikan Menu Cepat"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};
