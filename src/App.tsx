/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ScreenId, UserRole, UserProfile } from './types';
import {
  LECTURER_PROFILE,
  STUDENT_PROFILE,
  ADMIN_PROFILE,
} from './data/mockData';
import { getData } from './services/api';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ScreenSwitcherBar } from './components/ScreenSwitcherBar';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { LecturerDashboardScreen } from './screens/LecturerDashboardScreen';
import { StudentDashboardScreen } from './screens/StudentDashboardScreen';
import { AdminDashboardScreen } from './screens/AdminDashboardScreen';
import { CourseDetailScreen } from './screens/CourseDetailScreen';
import { AttendanceRecapScreen } from './screens/AttendanceRecapScreen';
import { AcademicRosterScreen } from './screens/AcademicRosterScreen';
import { CourseCatalogScreen } from './screens/CourseCatalogScreen';
import { GradebookScreen } from './screens/GradebookScreen';
import { StudentAdvisingScreen } from './screens/StudentAdvisingScreen';
import { ClassSchedulesScreen } from './screens/ClassSchedulesScreen';


/* =========================================================
   LOCAL STORAGE
========================================================= */

function readStoredUser() {
  try {
    const raw = localStorage.getItem('smartpeople_user');

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}


/* =========================================================
   ROLE MAPPING
========================================================= */

function mapStoredRole(role: any): UserRole {
  if (role === 'mahasiswa' || role === 'student') {
    return 'student';
  }

  if (role === 'dosen' || role === 'lecturer') {
    return 'lecturer';
  }

  return 'admin';
}


/* =========================================================
   APP
========================================================= */

export default function App() {

  /* -------------------------------------------------------
     Ambil session user dari localStorage
  ------------------------------------------------------- */

  const storedUser = readStoredUser();

  const storedRole = storedUser
    ? mapStoredRole(storedUser.role)
    : 'student';


  /* -------------------------------------------------------
     STATE
  ------------------------------------------------------- */

  const [currentRole, setCurrentRole] =
    useState<UserRole>(storedRole);

  const [currentScreen, setCurrentScreen] =
    useState<ScreenId>(
      storedUser
        ? (`dashboard-${storedRole}` as ScreenId)
        : 'login'
    );

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [loggedInUser, setLoggedInUser] =
    useState<any | null>(storedUser);


  /* =======================================================
     TEST CONNECTION GOOGLE SHEETS
  ======================================================= */

  useEffect(() => {

    getData('mahasiswa')
      .then((data) => {

        console.log(
          'Data mahasiswa dari Google Sheets:',
          data
        );

      })
      .catch((error) => {

        console.error(
          'Gagal mengambil data mahasiswa:',
          error
        );

      });

  }, []);


  /* =======================================================
     CURRENT USER
     
     Bagian ini penting untuk Header.
     
     Jika login sebagai mahasiswa:
     -> mengambil profile mahasiswa

     Jika login sebagai dosen:
     -> mengambil profile dosen

     Jika belum ada profile:
     -> menggunakan profile dummy sebagai fallback
  ======================================================= */

  const sessionProfile = loggedInUser?.profile;


  const currentUser: UserProfile =
    sessionProfile
      ? {
          id: String(
            sessionProfile.id ||
            loggedInUser?.id ||
            ''
          ),

          name: String(
            sessionProfile.nama ||
            loggedInUser?.username ||
            (
              currentRole === 'lecturer'
                ? LECTURER_PROFILE.name
                : currentRole === 'student'
                ? STUDENT_PROFILE.name
                : ADMIN_PROFILE.name
            )
          ),

          role: currentRole,

          title:
            currentRole === 'lecturer'
              ? 'Dosen'
              : currentRole === 'student'
              ? 'Mahasiswa'
              : 'Administrator',

          identifier: String(
            sessionProfile.nidn ||
            sessionProfile.nim ||
            loggedInUser?.username ||
            ''
          ),

          department: String(
            sessionProfile.prodi_id ||
            ''
          ),

          faculty: '',

          avatarUrl: String(
            sessionProfile.avatar_url ||
            ''
          ),

          semester: String(
            sessionProfile.semester ||
            ''
          ),

          activeStatus: String(
            sessionProfile.status ||
            'Aktif'
          ),
        }

      : currentRole === 'lecturer'
      ? LECTURER_PROFILE

      : currentRole === 'student'
      ? STUDENT_PROFILE

      : ADMIN_PROFILE;


  /* =======================================================
     ROLE CHANGE
  ======================================================= */

  const handleRoleChange = (
    newRole: UserRole
  ) => {

    const session =
      loggedInUser ||
      JSON.parse(
        localStorage.getItem(
          'smartpeople_user'
        ) || 'null'
      );


    if (session) {

      const mappedRole =
        newRole === 'student'
          ? 'mahasiswa'
          : newRole === 'lecturer'
          ? 'dosen'
          : 'admin';


      const updatedSession = {
        ...session,
        role: mappedRole,
      };


      localStorage.setItem(
        'smartpeople_user',
        JSON.stringify(updatedSession)
      );


      setLoggedInUser(
        updatedSession
      );
    }


    setCurrentRole(newRole);


    if (newRole === 'lecturer') {

      setCurrentScreen(
        'dashboard-lecturer'
      );

    } else if (newRole === 'student') {

      setCurrentScreen(
        'dashboard-student'
      );

    } else {

      setCurrentScreen(
        'dashboard-admin'
      );
    }
  };


  /* =======================================================
     LOGIN SUCCESS
     
     Setelah login:
     
     mahasiswa
     -> getData('mahasiswa')

     dosen
     -> getData('dosen')

     admin
     -> tidak perlu mengambil profile
  ======================================================= */

  const handleLoginSuccess = async (
    role: UserRole,
    user: any
  ) => {

    console.log(
      'User yang login:',
      user
    );


    /* -----------------------------------------------------
       Simpan role dan user sementara
    ----------------------------------------------------- */

    setCurrentRole(role);

    setLoggedInUser(user);


    localStorage.setItem(
      'smartpeople_user',
      JSON.stringify(user)
    );


    /* -----------------------------------------------------
       Ambil profile mahasiswa / dosen
    ----------------------------------------------------- */

    if (
      (role === 'student' ||
       role === 'lecturer') &&
      user.reference_id
    ) {

      try {

        /* Tentukan tabel berdasarkan role */

        const tableName =
          role === 'student'
            ? 'mahasiswa'
            : 'dosen';


        /* Ambil data dari Google Sheets */

        const data =
          await getData(tableName);


        console.log(
          `Data ${tableName} dari Google Sheets:`,
          data
        );


        /* Cari berdasarkan reference_id */

        const profile =
          data.find(
            (item: any) =>
              String(item.id)
                .trim() ===
              String(user.reference_id)
                .trim()
          );


        console.log(
          role === 'student'
            ? 'Profil mahasiswa:'
            : 'Profil dosen:',
          profile
        );


        /* -------------------------------------------------
           Jika profile ditemukan
        ------------------------------------------------- */

        if (profile) {

          const sessionUser = {
            ...user,
            profile,
          };


          setLoggedInUser(
            sessionUser
          );


          localStorage.setItem(
            'smartpeople_user',
            JSON.stringify(
              sessionUser
            )
          );

        } else {

          console.warn(
            `Data ${
              role === 'student'
                ? 'mahasiswa'
                : 'dosen'
            } tidak ditemukan untuk reference_id:`,
            user.reference_id
          );
        }


      } catch (error) {

        console.error(
          `Gagal mengambil data ${
            role === 'student'
              ? 'mahasiswa'
              : 'dosen'
          }:`,
          error
        );
      }
    }


    /* -----------------------------------------------------
       Pindah ke dashboard
    ----------------------------------------------------- */

    if (role === 'lecturer') {

      setCurrentScreen(
        'dashboard-lecturer'
      );

    } else if (role === 'student') {

      setCurrentScreen(
        'dashboard-student'
      );

    } else {

      setCurrentScreen(
        'dashboard-admin'
      );
    }
  };


  /* =======================================================
     LOGIN PAGE
  ======================================================= */

  if (currentScreen === 'login') {

    return (
      <div className="min-h-screen bg-surface font-body text-on-surface">

        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigate={(screen) =>
            setCurrentScreen(screen)
          }
        />

        <ScreenSwitcherBar
          currentScreen={currentScreen}
          currentRole={currentRole}
          onNavigate={(screen) =>
            setCurrentScreen(screen)
          }
          onChangeRole={handleRoleChange}
        />

      </div>
    );
  }


  /* =======================================================
     MAIN APP
  ======================================================= */

  return (

    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col selection:bg-primary-container selection:text-on-primary-container">

      {/* ===================================================
          HEADER
      =================================================== */}

      <Header
        currentUser={currentUser}

        currentScreen={currentScreen}

        onNavigate={(screen) => {

          /* Jika logout */

          if (screen === 'login') {

            localStorage.removeItem(
              'smartpeople_user'
            );

            setLoggedInUser(null);
          }


          setCurrentScreen(screen);

          setIsMobileMenuOpen(false);
        }}

        onChangeRole={handleRoleChange}

        onToggleMobileMenu={() =>
          setIsMobileMenuOpen(
            !isMobileMenuOpen
          )
        }
      />


      {/* ===================================================
          CONTENT WRAPPER
      =================================================== */}

      <div className="flex flex-1 pt-16">


        {/* =================================================
            SIDEBAR
        ================================================= */}

        <Sidebar
          currentScreen={currentScreen}

          currentRole={currentRole}

          onNavigate={(screen) => {

            setCurrentScreen(screen);

            setIsMobileMenuOpen(false);
          }}

          isOpenMobile={
            isMobileMenuOpen
          }

          onCloseMobile={() =>
            setIsMobileMenuOpen(false)
          }
        />


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="flex-1 lg:pl-64 min-w-0 transition-all duration-300">

          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-28">


            {/* =================================================
                DOSEN
            ================================================= */}

            {currentScreen === 'dashboard-lecturer' && (

              <LecturerDashboardScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}


            {/* =================================================
                MAHASISWA
            ================================================= */}

            {currentScreen === 'dashboard-student' && (

              <StudentDashboardScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }

                loggedInUser={
                  loggedInUser
                }
              />

            )}


            {/* =================================================
                ADMIN
            ================================================= */}

            {currentScreen === 'dashboard-admin' && (

              <AdminDashboardScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}


            {/* =================================================
                COURSE DETAIL
            ================================================= */}

            {currentScreen === 'course-detail' && (

              <CourseDetailScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}


            {/* =================================================
                ATTENDANCE RECAP
            ================================================= */}

            {currentScreen === 'attendance-recap' && (

              <AttendanceRecapScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}


            {/* =================================================
                ACADEMIC ROSTER
            ================================================= */}

            {currentScreen === 'academic-roster' && (

              <AcademicRosterScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}


            {/* =================================================
                COURSE CATALOG
            ================================================= */}

            {currentScreen === 'course-catalog' && (

              <CourseCatalogScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}


            {/* =================================================
                GRADEBOOK
            ================================================= */}

            {currentScreen === 'gradebook' && (

              <GradebookScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}


            {/* =================================================
                STUDENT ADVISING
            ================================================= */}

            {currentScreen === 'student-advising' && (

              <StudentAdvisingScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}


            {/* =================================================
                CLASS SCHEDULES
            ================================================= */}

            {currentScreen === 'class-schedules' && (

              <ClassSchedulesScreen
                onNavigate={(screen) =>
                  setCurrentScreen(screen)
                }
              />

            )}

          </div>

        </main>

      </div>


      {/* =====================================================
          SCREEN SWITCHER
      ===================================================== */}

      <ScreenSwitcherBar
        currentScreen={currentScreen}
        currentRole={currentRole}

        onNavigate={(screen) =>
          setCurrentScreen(screen)
        }

        onChangeRole={
          handleRoleChange
        }
      />

    </div>
  );
}