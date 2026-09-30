import React from 'react';
import { ScreenId, UserRole } from '../types';

interface SidebarProps {
  currentScreen: ScreenId;
  currentRole: UserRole;
  onNavigate: (screen: ScreenId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  currentRole,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const getRoleLabel = () => {
    switch (currentRole) {
      case 'lecturer':
        return 'Lecturer';
      case 'student':
        return 'Student';
      case 'admin':
        return 'Admin';
      default:
        return 'Portal';
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      screen: (currentRole === 'lecturer'
        ? 'dashboard-lecturer'
        : currentRole === 'student'
        ? 'dashboard-student'
        : 'dashboard-admin') as ScreenId,
      activeScreens: ['dashboard-lecturer', 'dashboard-student', 'dashboard-admin'],
    },
    {
      id: 'course-catalog',
      label: 'Course Catalog',
      icon: 'menu_book',
      screen: 'course-catalog' as ScreenId,
      activeScreens: ['course-catalog'],
    },
    {
      id: 'academic-roster',
      label: 'Academic Roster',
      icon: 'group',
      screen: 'academic-roster' as ScreenId,
      activeScreens: ['academic-roster'],
    },
    {
      id: 'gradebook',
      label: 'Gradebook',
      icon: 'assignment_turned_in',
      screen: 'gradebook' as ScreenId,
      activeScreens: ['gradebook'],
    },
    {
      id: 'class-schedules',
      label: 'Class Schedules',
      icon: 'calendar_month',
      screen: 'class-schedules' as ScreenId,
      activeScreens: ['class-schedules'],
    },
    {
      id: 'student-advising',
      label: 'Student Advising',
      icon: 'school',
      screen: 'student-advising' as ScreenId,
      activeScreens: ['student-advising'],
    },
    {
      id: 'course-detail',
      label: 'Detail Matkul & Tugas',
      icon: 'auto_stories',
      screen: 'course-detail' as ScreenId,
      activeScreens: ['course-detail'],
    },
    {
      id: 'attendance-recap',
      label: 'Rekap Presensi & Kehadiran',
      icon: 'fact_check',
      screen: 'attendance-recap' as ScreenId,
      activeScreens: ['attendance-recap'],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-primary/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-primary-container z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transform transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Header Bar */}
          <div className="h-16 px-space-lg flex items-center justify-between bg-primary border-b border-surface-container/20">
            <div className="flex items-center gap-space-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed"></div>
              <span className="font-headline-md text-headline-md text-on-primary tracking-tight font-bold">
                Academic Portal
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-sm text-[11px] uppercase tracking-wider font-semibold">
              {getRoleLabel()}
            </span>
          </div>

          {/* Section Heading */}
          <div className="px-space-md py-space-sm">
            <p className="px-space-sm py-space-xs font-label-sm text-[11px] text-on-primary-container uppercase tracking-wider font-semibold">
              Academic Management
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-space-md overflow-y-auto max-h-[calc(100vh-230px)]">
            {navItems.map((item) => {
              const isActive = item.activeScreens.includes(currentScreen);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.screen);
                    onCloseMobile();
                  }}
                  className={`flex items-center gap-space-sm px-space-md py-2.5 rounded-lg text-left transition-colors font-label-md text-label-md cursor-pointer ${
                    isActive
                      ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                      : 'text-on-primary-container hover:bg-primary hover:text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Status & Sign Out */}
        <div className="p-space-md flex flex-col gap-space-sm bg-primary/40 border-t border-outline/20">
          <div className="px-space-sm flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] text-on-primary-container">
                System Status
              </span>
              <span className="font-label-sm text-[12px] text-tertiary-fixed font-semibold">
                Connected: SIAK-Core
              </span>
            </div>
            <span className="material-symbols-outlined text-tertiary-fixed text-lg">
              check_circle
            </span>
          </div>

          <button
            onClick={() => {
              onNavigate('login');
              onCloseMobile();
            }}
            className="flex items-center gap-space-sm px-space-md py-2 rounded-lg text-on-primary-container hover:bg-error hover:text-on-error transition-colors font-label-md text-label-md cursor-pointer w-full text-left"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
