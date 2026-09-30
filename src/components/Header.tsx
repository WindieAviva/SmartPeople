import React, { useState } from 'react';
import {
  UserProfile,
  ScreenId,
  UserRole,
} from '../types';


interface HeaderProps {
  currentUser: UserProfile;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onChangeRole: (role: UserRole) => void;
  onToggleMobileMenu?: () => void;
}


export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentScreen,
  onNavigate,
  onChangeRole,
  onToggleMobileMenu,
}) => {


  /* =====================================================
     STATE
  ===================================================== */

  const [
    showNotifications,
    setShowNotifications
  ] = useState(false);

  const [
    unreadCount,
    setUnreadCount
  ] = useState(3);

  const [
    showRoleMenu,
    setShowRoleMenu
  ] = useState(false);


  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const notifications = [

    {
      id: 1,
      title: 'Batas Input Nilai UTS',
      desc: 'Batas akhir penyerahan nilai UTS tersisa 4 hari lagi.',
      time: '15 menit lalu',
      type: 'warning',
    },

    {
      id: 2,
      title: 'Tugas Masuk Baru (TIF-204)',
      desc: '35 mahasiswa mengumpulkan Tugas Praktikum 04.',
      time: '1 jam lalu',
      type: 'info',
    },

    {
      id: 3,
      title: 'Pengajuan Dispensasi Mahasiswa',
      desc: 'Siti Anindya Zahra mengajukan izin delegasi Gemastik.',
      time: '3 jam lalu',
      type: 'success',
    },

  ];


  /* =====================================================
     ROLE LABEL
  ===================================================== */

  const roleLabel =
    currentUser.role === 'lecturer'
      ? 'Dosen'
      : currentUser.role === 'student'
      ? 'Mahasiswa'
      : 'Admin';


  /* =====================================================
     PROFILE TITLE
  ===================================================== */

  const profileTitle =
    currentUser.title ||
    roleLabel;


  /* =====================================================
     HEADER
  ===================================================== */

  return (

    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-md lg:px-space-lg border-b border-surface-container/60">


      {/* =================================================
          BRAND
      ================================================= */}

      <div className="flex items-center gap-space-md">


        {/* Mobile Menu */}

        {onToggleMobileMenu && (

          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container lg:hidden cursor-pointer"
            aria-label="Buka Menu"
          >

            <span className="material-symbols-outlined text-2xl">
              menu
            </span>

          </button>

        )}


        {/* Logo */}

        <button
          onClick={() => {

            if (
              currentUser.role === 'lecturer'
            ) {

              onNavigate(
                'dashboard-lecturer'
              );

            } else if (
              currentUser.role === 'student'
            ) {

              onNavigate(
                'dashboard-student'
              );

            } else {

              onNavigate(
                'dashboard-admin'
              );

            }

          }}

          className="flex items-center gap-space-sm hover:opacity-90 transition-opacity"
        >

          <img
            alt="SmartPeople Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1WcK4gAGRRp8zhWVnd9qISYRvj0LMtg-AL6PWXAHD-6AI8BFlJW0WfGmibzmvD4pUkaldaje8ausWzg0pOSPftK0OyM6PbHvsCqadmnBL_VxplQBOf-KjFdRHhwYhZ48XJtEVxyhnNskdyRx9CZKO6gXhjOgiRm8P8z1q-zqXdXQmavJyS1DNqKHNyaI-4mIjxVR4JHvXW2Q07oX5cFhQfecgS1yZQURNTkZRrWbSloE1kFrTkMXj-V4mQ"
          />

        </button>


        {/* Divider */}

        <div className="h-6 w-px bg-surface-variant hidden sm:block"></div>


        {/* Brand Text */}

        <div className="hidden sm:flex flex-col">

          <span className="font-title-md text-title-md text-primary font-bold leading-tight">
            SmartPeople
          </span>

          <span className="font-body-sm text-body-sm text-on-surface-variant hidden md:inline-block">
            Smart Learning Management for Higher Education
          </span>

        </div>

      </div>


      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="flex items-center gap-space-sm sm:gap-space-md">


        {/* =================================================
            SEMESTER
        ================================================= */}

        <div className="hidden md:flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">

          <span className="material-symbols-outlined text-base text-secondary">
            event_upcoming
          </span>

          <span>
            Semester Genap 2025/2026
          </span>

        </div>


        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <div className="relative">

          <button
            onClick={() => {

              setShowNotifications(
                !showNotifications
              );

              setShowRoleMenu(false);

            }}

            aria-label="Notifikasi"

            className="relative p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >

            <span className="material-symbols-outlined">
              notifications
            </span>


            {unreadCount > 0 && (

              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-on-error font-label-sm text-[10px] flex items-center justify-center font-bold">

                {unreadCount}

              </span>

            )}

          </button>


          {/* Notification Popup */}

          {showNotifications && (

            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-surface-container-lowest shadow-xl border border-surface-container z-50 p-space-sm flex flex-col gap-space-xs">


              <div className="flex items-center justify-between p-2 border-b border-surface-container">

                <span className="font-title-md text-label-md text-primary font-bold">
                  Notifikasi Akademik
                </span>


                {unreadCount > 0 && (

                  <button
                    onClick={() =>
                      setUnreadCount(0)
                    }

                    className="text-xs text-secondary hover:underline font-semibold"
                  >
                    Tandai dibaca
                  </button>

                )}

              </div>


              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">


                {notifications.map(
                  (notification) => (

                    <div
                      key={notification.id}
                      className="p-2.5 rounded-lg hover:bg-surface-container-low transition-colors flex flex-col gap-0.5 cursor-pointer"
                    >

                      <div className="flex items-center justify-between">

                        <span className="font-label-sm text-label-sm text-primary font-bold">
                          {notification.title}
                        </span>

                        <span className="text-[11px] text-on-surface-variant font-code-sm">
                          {notification.time}
                        </span>

                      </div>


                      <p className="text-body-sm text-on-surface-variant text-xs">
                        {notification.desc}
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>


        {/* Divider */}

        <div className="h-6 w-px bg-surface-variant"></div>


        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="relative">


          <button
            onClick={() => {

              setShowRoleMenu(
                !showRoleMenu
              );

              setShowNotifications(false);

            }}

            className="flex items-center gap-space-sm p-1 rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
          >


            {/* Avatar */}

            <div className="relative">

              <img
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover shadow-xs"

                src={
                  currentUser.avatarUrl ||
                  'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(
                      currentUser.name ||
                      'User'
                    )
                }

                onError={(event) => {

                  const image =
                    event.currentTarget;

                  image.src =
                    'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(
                      currentUser.name ||
                      'User'
                    );

                }}
              />

              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim ring-2 ring-surface-container-lowest"></span>

            </div>


            {/* User Information */}

            <div className="hidden lg:flex flex-col text-left">

              <span className="font-label-md text-label-md text-on-surface leading-tight font-semibold">

                {currentUser.name}

              </span>


              <span className="font-body-sm text-body-sm text-on-surface-variant leading-none text-xs">

                {profileTitle}

              </span>

            </div>


            {/* Role Badge */}

            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[11px] hidden xl:inline-block font-semibold">

              {roleLabel}

            </span>


            <span className="material-symbols-outlined text-sm text-on-surface-variant">
              expand_more
            </span>

          </button>


          {/* =================================================
              ROLE MENU
          ================================================= */}

          {showRoleMenu && (

            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-surface-container-lowest shadow-2xl border border-surface-container z-50 p-space-sm flex flex-col gap-1.5">


              {/* Header */}

              <div className="p-2 border-b border-surface-container">

                <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold block">
                  Beralih Peran Simulasi:
                </span>

                <span className="text-xs text-on-surface-variant">
                  Ganti profil untuk melihat dashboard peran terkait:
                </span>

              </div>


              {/* =================================================
                  DOSEN
              ================================================= */}

              <button
                onClick={() => {

                  onChangeRole(
                    'lecturer'
                  );

                  onNavigate(
                    'dashboard-lecturer'
                  );

                  setShowRoleMenu(false);

                }}

                className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                  currentUser.role === 'lecturer'
                    ? 'bg-secondary text-on-secondary font-bold'
                    : 'hover:bg-surface-container text-on-surface'
                }`}
              >

                <span className="material-symbols-outlined text-base">
                  badge
                </span>


                <div className="flex flex-col">

                  <span>
                    Dosen Pengampu / PA
                  </span>

                  <span className="text-[10px] opacity-80">

                    {currentUser.role === 'lecturer'
                      ? currentUser.name
                      : 'Dosen Pengampu'}

                  </span>

                </div>

              </button>


              {/* =================================================
                  MAHASISWA
              ================================================= */}

              <button
                onClick={() => {

                  onChangeRole(
                    'student'
                  );

                  onNavigate(
                    'dashboard-student'
                  );

                  setShowRoleMenu(false);

                }}

                className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                  currentUser.role === 'student'
                    ? 'bg-secondary text-on-secondary font-bold'
                    : 'hover:bg-surface-container text-on-surface'
                }`}
              >

                <span className="material-symbols-outlined text-base">
                  school
                </span>


                <div className="flex flex-col">

                  <span>
                    Mahasiswa Aktif
                  </span>

                  <span className="text-[10px] opacity-80">

                    {currentUser.role === 'student'
                      ? currentUser.name
                      : 'Mahasiswa Aktif'}

                  </span>

                </div>

              </button>


              {/* =================================================
                  ADMIN
              ================================================= */}

              <button
                onClick={() => {

                  onChangeRole(
                    'admin'
                  );

                  onNavigate(
                    'dashboard-admin'
                  );

                  setShowRoleMenu(false);

                }}

                className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                  currentUser.role === 'admin'
                    ? 'bg-secondary text-on-secondary font-bold'
                    : 'hover:bg-surface-container text-on-surface'
                }`}
              >

                <span className="material-symbols-outlined text-base">
                  admin_panel_settings
                </span>


                <div className="flex flex-col">

                  <span>
                    Administrator Kampus
                  </span>

                  <span className="text-[10px] opacity-80">

                    {currentUser.role === 'admin'
                      ? currentUser.name
                      : 'Administrator Kampus'}

                  </span>

                </div>

              </button>


              {/* =================================================
                  LOGOUT
              ================================================= */}

              <div className="pt-1 border-t border-surface-container">

                <button
                  onClick={() => {

                    onNavigate('login');

                    setShowRoleMenu(false);

                  }}

                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs text-error hover:bg-error-container/30 transition-colors"
                >

                  <span className="material-symbols-outlined text-sm">
                    logout
                  </span>

                  <span>
                    Keluar ke Halaman Login
                  </span>

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </header>
  );
};