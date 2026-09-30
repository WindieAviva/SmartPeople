import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';
import { getData } from '../services/api';
import { findById, getSessionUser, loadAcademicTables, studentCourses } from '../services/academicData';

interface StudentDashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
  loggedInUser: any;
}

export const StudentDashboardScreen: React.FC<StudentDashboardScreenProps> = ({
  onNavigate,
  loggedInUser,
}) => {
  const [showKrsModal, setShowKrsModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCheckedIn, setQrCheckedIn] = useState(false);

  // =========================================================
  // DATA MAHASISWA
  // =========================================================

  const [student, setStudent] = useState<any | null>(null);

  // DATA PROGRAM STUDI
  const [programStudy, setProgramStudy] = useState<any | null>(null);

  // STATUS LOADING
  const [isLoadingStudent, setIsLoadingStudent] = useState(true);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [mySchedule, setMySchedule] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [myGrades, setMyGrades] = useState<any[]>([]);

  useEffect(() => {
    const loadAcademic = async () => {
      try {
        const tables = await loadAcademicTables();
        const session = loggedInUser || getSessionUser();
        const studentId = session?.reference_id;
        if (!studentId) return;
        const courses = studentCourses(tables, studentId);
        setMyCourses(courses);
        const classIds = new Set(courses.map((c) => String(c.course.id).trim()));
        const tasks = tables.tugas.filter((t) => classIds.has(String(t.kelas_id).trim())).map((t) => {
          const c = courses.find((x) => String(x.course.id).trim() === String(t.kelas_id).trim());
          const submission = tables.pengumpulan_tugas.find((p) => String(p.tugas_id).trim() === String(t.id).trim() && String(p.mahasiswa_id).trim() === String(studentId).trim());
          return { ...t, course: c?.course, submission };
        });
        setMyTasks(tasks);
        const schedule = tables.jadwal.filter((j) => classIds.has(String(j.kelas_id).trim())).map((j) => {
          const c = courses.find((x) => String(x.course.id).trim() === String(j.kelas_id).trim());
          return { ...j, course: c?.course };
        });
        setMySchedule(schedule);
        setMyAttendance(tables.absensi.filter((a) => String(a.mahasiswa_id).trim() === String(studentId).trim()));
        setMyGrades(tables.nilai.filter((n) => String(n.mahasiswa_id).trim() === String(studentId).trim()));
      } catch (error) {
        console.error('Gagal mengambil data akademik dashboard:', error);
      }
    };
    loadAcademic();
  }, [loggedInUser]);

  // =========================================================
  // MENGAMBIL DATA MAHASISWA + PROGRAM STUDI
  // =========================================================

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setIsLoadingStudent(true);

        console.log('=================================');
        console.log('MENGAMBIL DATA MAHASISWA');
        console.log('=================================');

        console.log('User yang login:', loggedInUser);

        const referenceId = loggedInUser?.reference_id;

        console.log('Reference ID:', referenceId);

        if (!referenceId) {
          console.warn(
            'Reference ID mahasiswa tidak ditemukan.'
          );

          setIsLoadingStudent(false);
          return;
        }

        // =====================================================
        // AMBIL DATA MAHASISWA
        // =====================================================

        const mahasiswa = await getData('mahasiswa');

        console.log(
          'Data mahasiswa dari Google Sheets:',
          mahasiswa
        );

        const foundStudent = mahasiswa.find(
          (item: any) =>
            String(item.id).trim() ===
            String(referenceId).trim()
        );

        console.log(
          'Mahasiswa yang ditemukan:',
          foundStudent
        );

        if (!foundStudent) {
          console.warn(
            'Data mahasiswa tidak ditemukan untuk reference_id:',
            referenceId
          );

          setIsLoadingStudent(false);
          return;
        }

        setStudent(foundStudent);

        // =====================================================
        // AMBIL DATA PROGRAM STUDI
        // =====================================================

        console.log('=================================');
        console.log('MENGAMBIL DATA PROGRAM STUDI');
        console.log('=================================');

        const programStudi = await getData('program_studi');

        console.log(
          'Data program studi dari Google Sheets:',
          programStudi
        );

        const foundProgramStudy = programStudi.find(
          (item: any) =>
            String(item.id).trim() ===
            String(foundStudent.prodi_id).trim()
        );

        console.log(
          'Program studi yang ditemukan:',
          foundProgramStudy
        );

        if (foundProgramStudy) {
          setProgramStudy(foundProgramStudy);
        } else {
          console.warn(
            'Program studi tidak ditemukan untuk prodi_id:',
            foundStudent.prodi_id
          );
        }

      } catch (error) {
        console.error(
          'Gagal mengambil data mahasiswa:',
          error
        );
      } finally {
        setIsLoadingStudent(false);
      }
    };

    loadStudentData();
  }, [loggedInUser]);

  // =========================================================
  // RETURN
  // =========================================================

  const totalSks = myCourses.reduce((sum, item) => sum + Number(item.course?.mataKuliah?.sks || 0), 0);
  const attendanceRate = myAttendance.length ? Math.round((myAttendance.filter((a) => String(a.status || '').toUpperCase() === 'HADIR').length / myAttendance.length) * 1000) / 10 : 0;
  const gpaFromGrades = myGrades.length ? (myGrades.reduce((sum, n) => sum + Number(n.nilai_akhir || 0), 0) / myGrades.length / 25).toFixed(2) : '-';

  return (
    <div className="flex flex-col w-full gap-space-lg">

      {/* =====================================================
          STUDENT WELCOME BANNER
      ===================================================== */}

      <div className="relative overflow-hidden rounded-xl bg-primary-container text-on-primary shadow-xl">

        <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>

        <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-tertiary-fixed-dim/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between p-space-lg gap-space-lg">

          {/* =================================================
              INFORMASI MAHASISWA
          ================================================= */}

          <div className="flex items-center gap-space-md">

            {/* FOTO */}

            <div className="relative">

              <img
                alt={student?.nama || 'Mahasiswa'}
                className="w-20 h-20 rounded-full object-cover shadow-md"
                src={
                  student?.avatar_url ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuD_bX6YuVcAk6SMt351mgSQhzl0ADdzfoR0SSt2NcXmJYiMiewCMJZ1izfq5e0JRixBm0Da1grGKwjXtIhU5EKtCA4qTPc_uKa1Aneo4t_d6K0OeGMmMSc5ZRBJ7DvTpC4GVvOevB-SDbDqJdiF5xg3k7-NK_egDiEXHeKV8dosHbmIN_J2-r6l2hHe-_iQcIKMUBAyAWgrp3V6X6NqqnkoMsn9JDU8Bswi2AsIgLY_S6fsKpfuqYuMTg'
                }
              />

              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-tertiary-fixed-dim ring-4 ring-primary-container"></span>

            </div>

            {/* DATA MAHASISWA */}

            <div className="flex flex-col">

              <div className="flex items-center gap-space-xs flex-wrap">

                <span className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-primary">

                  {isLoadingStudent
                    ? 'Memuat data...'
                    : `Halo, ${student?.nama || 'Mahasiswa'}!`}

                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm tracking-wide font-semibold">
                  Mahasiswa Aktif
                </span>

              </div>

              {/* NIM + PROGRAM STUDI */}

              <p className="font-body-md text-body-md text-on-primary-container mt-1">

                NIM:{' '}

                <span className="font-code-sm text-code-sm text-secondary-fixed">

                  {student?.nim || '-'}

                </span>

                {' • '}

                {programStudy
                  ? `${programStudy.jenjang} ${programStudy.nama}`
                  : 'Memuat program studi...'}

              </p>

              {/* FAKULTAS */}

              <p className="font-body-sm text-body-sm text-primary-fixed mt-1">

                {programStudy?.fakultas ||
                  'Memuat fakultas...'}

              </p>

              {/* SEMESTER + IPK + SKS */}

              <div className="flex items-center gap-space-sm mt-2 flex-wrap">

                {/* SEMESTER */}

                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-fixed bg-primary/60 px-2.5 py-1 rounded-md">

                  <span className="material-symbols-outlined text-sm text-tertiary-fixed">
                    school
                  </span>

                  Semester {student?.semester || '-'}

                </span>

                {/* IPK */}

                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-fixed bg-primary/60 px-2.5 py-1 rounded-md">

                  <span className="material-symbols-outlined text-sm text-secondary-fixed">
                    workspace_premium
                  </span>

                  IPK Terakhir:{' '}

                  <strong className="text-tertiary-fixed font-bold">
                    {gpaFromGrades}
                  </strong>

                </span>

                {/* TOTAL SKS */}

                <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-fixed bg-primary/60 px-2.5 py-1 rounded-md">

                  <span className="material-symbols-outlined text-sm text-secondary-fixed-dim">
                    auto_stories
                  </span>

                  Total SKS:{' '}

                  <strong className="text-on-primary font-bold">
                    {totalSks} SKS
                  </strong>

                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              BUTTON KRS + TRANSKRIP
          ================================================= */}

          <div className="flex items-center gap-space-sm self-stretch lg:self-center justify-end">

            <button
              onClick={() => setShowKrsModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md hover:bg-surface-container transition shadow-sm cursor-pointer"
            >

              <span className="material-symbols-outlined text-lg text-secondary">
                badge
              </span>

              Kartu Rencana Studi (KRS)

            </button>

            <button
              onClick={() => setShowTranscriptModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary-container transition shadow-md cursor-pointer font-bold"
            >

              <span className="material-symbols-outlined text-lg">
                history_edu
              </span>

              Transkrip Nilai

            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          4 METRIC CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">

        {/* MATA KULIAH */}

        <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container">

          <div className="flex items-center justify-between">

            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
              Mata Kuliah Aktif
            </span>

            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">

              <span className="material-symbols-outlined text-xl">
                menu_book
              </span>

            </div>

          </div>

          <div className="flex items-baseline gap-2 mt-space-md">

            <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
              7
            </span>

            <span className="font-body-md text-body-md text-on-surface-variant">
              Mata Kuliah
            </span>

          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-container/60">

            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Beban Akademik
            </span>

            <span className="font-label-sm text-label-sm text-secondary font-semibold bg-surface-container px-2 py-0.5 rounded">
              {totalSks} SKS Total
            </span>

          </div>

        </div>

        {/* TUGAS */}

        <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container">

          <div className="flex items-center justify-between">

            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
              Tugas Menunggu
            </span>

            <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error">

              <span className="material-symbols-outlined text-xl">
                assignment_late
              </span>

            </div>

          </div>

          <div className="flex items-baseline gap-2 mt-space-md">

            <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
              3
            </span>

            <span className="font-body-md text-body-md text-on-surface-variant">
              Tugas Aktif
            </span>

          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-container/60">

            <span className="font-label-sm text-label-sm text-error font-semibold flex items-center gap-1">

              <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>

              1 Mendekati Deadline

            </span>

            <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
              Besok, 23:59
            </span>

          </div>

        </div>

        {/* KEHADIRAN */}

        <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container">

          <div className="flex items-center justify-between">

            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
              Rata-rata Kehadiran
            </span>

            <div className="w-10 h-10 rounded-lg bg-tertiary-container flex items-center justify-center text-tertiary-fixed">

              <span className="material-symbols-outlined text-xl">
                fact_check
              </span>

            </div>

          </div>

          <div className="flex items-baseline gap-2 mt-space-md">

            <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
              {attendanceRate}%
            </span>

          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-container/60">

            <span className="font-label-sm text-label-sm text-tertiary-container font-semibold flex items-center gap-1">

              <span className="material-symbols-outlined text-base text-on-tertiary-container">
                verified
              </span>

              Aman dari batas min. (75%)

            </span>

          </div>

        </div>

        {/* TARGET IPS */}

        <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container">

          <div className="flex items-center justify-between">

            <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
              Target IPS Semester Ini
            </span>

            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">

              <span className="material-symbols-outlined text-xl">
                trending_up
              </span>

            </div>

          </div>

          <div className="flex items-baseline gap-2 mt-space-md">

            <span className="font-headline-xl text-headline-xl font-bold text-secondary">
              3.85
            </span>

            <span className="font-label-sm text-label-sm text-on-tertiary-container font-semibold bg-surface-container px-2 py-0.5 rounded">
              +0.03 prev
            </span>

          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-container/60">

            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Status Komparatif
            </span>

            <span className="font-label-sm text-label-sm font-semibold text-secondary">
              Top 5% Angkatan
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-space-lg">

        {/* ===================================================
            LEFT COLUMN
        =================================================== */}

        <div className="xl:col-span-2 flex flex-col gap-space-lg">

          {/* =================================================
              MATA KULIAH SAYA
          ================================================= */}

          <div className="flex flex-col gap-space-md">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-space-sm">

                <div className="w-2.5 h-6 rounded-full bg-secondary"></div>

                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Mata Kuliah Saya
                </h2>

                <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                  Semester Genap 2025/2026
                </span>

              </div>

              <button
                onClick={() => onNavigate('course-catalog')}
                className="font-label-md text-label-md text-secondary hover:text-secondary-container transition flex items-center gap-1 cursor-pointer font-bold"
              >

                Lihat Semua ({myCourses.length})

                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>

              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {myCourses.length === 0 ? (
                <div className="md:col-span-2 p-8 rounded-xl border border-surface-container bg-surface-container-lowest text-sm text-on-surface-variant text-center">Belum ada KRS/mata kuliah yang terhubung untuk akun ini.</div>
              ) : myCourses.map((item) => {
                const c = item.course;
                const attendance = myAttendance.filter((a) => String(a.kelas_id).trim() === String(c.id).trim());
                return (
                  <div key={c.id} className="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition group border border-surface-container">
                    <div className="flex flex-col gap-space-sm">
                      <div className="flex items-start justify-between gap-2"><span className="px-2.5 py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed font-code-sm font-semibold">{c.mataKuliah?.kode || '-'} • {c.mataKuliah?.sks || 0} SKS</span><span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm">{c.nama_kelas || '-'}</span></div>
                      <h3 className="font-title-md font-bold text-on-surface group-hover:text-secondary transition-colors">{c.mataKuliah?.nama || '-'}</h3>
                      <div className="flex items-center gap-space-sm text-on-surface-variant"><span className="material-symbols-outlined text-base">person</span><span className="font-body-sm">{c.dosen?.nama || '-'}</span></div>
                    </div>
                    <div className="pt-space-md mt-space-md flex items-center justify-between border-t border-surface-container/60"><span className="font-body-sm text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-base text-tertiary-fixed-dim">check_circle</span>{attendance.length} Kehadiran</span><button onClick={() => onNavigate('course-detail')} className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm hover:bg-primary hover:text-on-primary transition flex items-center gap-1 cursor-pointer">Lihat Kelas<span className="material-symbols-outlined text-sm">navigate_next</span></button></div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* =================================================
              TUGAS & DEADLINE
          ================================================= */}

          <div className="flex flex-col gap-space-md">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-space-sm">

                <div className="w-2.5 h-6 rounded-full bg-error"></div>

                <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Daftar Tugas &amp; Deadline Terdekat
                </h2>

              </div>

              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Diperbarui 10 menit lalu
              </span>

            </div>

            <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">

              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">

                      <th className="py-3 px-space-md">
                        Mata Kuliah &amp; Tugas
                      </th>

                      <th className="py-3 px-space-md">
                        Batas Waktu
                      </th>

                      <th className="py-3 px-space-md">
                        Status Pengumpulan
                      </th>

                      <th className="py-3 px-space-md text-right">
                        Aksi / Nilai
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                    {myTasks.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-sm text-on-surface-variant">Belum ada tugas dari kelas yang terdaftar.</td></tr>
                    ) : myTasks.slice(0, 8).map((task) => (
                      <tr key={task.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3.5 px-space-md"><div className="flex flex-col"><span className="font-label-md font-semibold text-on-surface">{task.judul || '-'}</span><span className="font-body-sm text-on-surface-variant">{task.course?.mataKuliah?.nama || '-'}</span></div></td>
                        <td className="py-3.5 px-space-md"><span className="font-body-sm text-on-surface-variant">{task.deadline || '-'}</span></td>
                        <td className="py-3.5 px-space-md"><span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm font-semibold">{task.submission ? (task.submission.nilai ? `Nilai: ${task.submission.nilai}` : 'Sudah Dikumpulkan') : 'Belum Dikumpulkan'}</span></td>
                        <td className="py-3.5 px-space-md text-right"><button onClick={() => onNavigate('course-detail')} className="px-3.5 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm hover:bg-secondary-container transition inline-flex items-center gap-1 shadow-sm cursor-pointer font-bold">Lihat Tugas</button></td>
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            RIGHT COLUMN
        ===================================================== */}

        <div className="flex flex-col gap-space-lg">

          {/* =================================================
              JADWAL HARI INI
          ================================================= */}

          <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-space-md">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Jadwal Kuliah</h2>
              <button onClick={() => onNavigate('class-schedules')} className="text-secondary text-sm font-semibold">Lihat semua</button>
            </div>
            <div className="flex flex-col gap-3">
              {mySchedule.length === 0 ? (
                <div className="p-5 text-center text-sm text-on-surface-variant">Belum ada jadwal yang terhubung dengan KRS.</div>
              ) : mySchedule.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
                  <div className="w-16 shrink-0 text-center"><div className="font-bold text-sm">{item.hari || '-'}</div><div className="text-xs text-on-surface-variant">{item.jam_mulai || '-'}-{item.jam_selesai || '-'}</div></div>
                  <div className="w-px h-10 bg-surface-container-high" />
                  <div className="min-w-0"><div className="font-semibold text-sm truncate">{item.course?.mataKuliah?.nama || '-'}</div><div className="text-xs text-on-surface-variant">{item.ruangan || '-'} • {item.course?.dosen?.nama || '-'}</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
              PENGUMUMAN
          ================================================= */}

          <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">

            <div className="flex items-center justify-between mb-space-md">

              <div className="flex items-center gap-space-sm">

                <span className="material-symbols-outlined text-secondary text-xl">
                  notifications_active
                </span>

                <h3 className="font-title-md text-title-md font-bold text-on-surface">
                  Pengumuman Dosen
                </h3>

              </div>

              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>

            </div>

            <div className="flex flex-col gap-space-md">

              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 hover:bg-surface-container transition">

                <div className="flex items-center justify-between">

                  <span className="font-label-sm text-label-sm font-semibold text-primary">
                    Dr. Sri Mulyani, M.T.
                  </span>

                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    1 jam lalu
                  </span>

                </div>

                <p className="font-body-sm text-body-sm text-on-surface">

                  Materi slide kuliah sesi 8 (Normalisasi 3NF &amp; BCNF)
                  sudah diunggah ke Google Classroom &amp; SIAK. Silakan
                  unduh sebelum kelas siang ini.

                </p>

              </div>

              <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1 hover:bg-surface-container transition">

                <div className="flex items-center justify-between">

                  <span className="font-label-sm text-label-sm font-semibold text-primary">
                    Biro Akademik (BAAK)
                  </span>

                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Kemarin
                  </span>

                </div>

                <p className="font-body-sm text-body-sm text-on-surface">

                  Pengisian Evaluasi Dosen oleh Mahasiswa (EDOM) Tengah
                  Semester dibuka hingga 28 Mei 2025 sebagai syarat
                  pencetakan Kartu Ujian.

                </p>

              </div>

            </div>

            <button
              onClick={() =>
                alert(
                  'Pusat Pengumuman Akademik: Tidak ada pengumuman mendesak lainnya.'
                )
              }
              className="mt-space-md w-full py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition text-center cursor-pointer font-semibold"
            >
              Buka Pusat Pengumuman
            </button>

          </div>

          {/* =================================================
              DOSEN PEMBIMBING
          ================================================= */}

          <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container">

            <div className="flex items-center gap-space-sm mb-space-sm">

              <span className="material-symbols-outlined text-secondary text-xl">
                contact_support
              </span>

              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                Dosen Pembimbing Akademik
              </h3>

            </div>

            <div className="flex items-center gap-space-md p-3 rounded-lg bg-surface-container-low">

              <img
                alt="Dr. Aris Thorne"
                className="w-12 h-12 rounded-full object-cover shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMc4Heogh3igv7B419pvDv__2TV__EplC-jzZB0tIu-89GhZyprykDHJxWoGnYOqJzY8mJLkB17b705nl-BSmkAOWxS8KzlNuyAzqnNy7yUVmkrYeD9Gao8yLQhH4RQRoPIUoY8nyLvTw78CSQYLQHNo15wpn66OC4Ddy2HgIln4rcZUKCSN69C5aNZmftqQ9t7dLKy21nAwDB_KA_D15MSSmx69iMdD4287GBRxvFewl0JeDnyfgOyQ"
              />

              <div className="flex flex-col min-w-0">

                <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                  Dr. Aris Thorne, M.Kom.
                </span>

                <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                  NIP: 198204122008121001
                </span>

                <span className="font-label-sm text-label-sm text-tertiary-container flex items-center gap-1 mt-0.5 font-semibold">

                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>

                  Jadwal Konsultasi: Rabu, 10:00

                </span>

              </div>

            </div>

            <button
              onClick={() => onNavigate('student-advising')}
              className="mt-3 w-full py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-sm text-label-sm transition flex items-center justify-center gap-1 shadow-sm cursor-pointer font-bold"
            >

              <span className="material-symbols-outlined text-sm">
                chat
              </span>

              Ajukan Bimbingan KRS / Skripsi

            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          MODAL KRS
      ===================================================== */}

      {showKrsModal && (

        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">

          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md">

            <div className="flex items-center justify-between border-b border-surface-container pb-2">

              <div>

                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">
                  Kartu Rencana Studi (KRS)
                </span>

                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  Semester Genap 2025/2026
                </h3>

              </div>

              <button
                onClick={() => setShowKrsModal(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >

                <span className="material-symbols-outlined">
                  close
                </span>

              </button>

            </div>

            <div className="bg-surface-container-low p-3 rounded-lg flex justify-between text-xs">

              <span>
                Mahasiswa:{' '}

                <strong>
                  {student?.nama || '-'} ({student?.nim || '-'})
                </strong>

              </span>

              <span>
                Dosen PA:{' '}

                <strong>
                  Dr. Aris Thorne, M.Kom.
                </strong>

              </span>

              <span className="text-on-tertiary-container font-bold">
                Status: Disetujui (21 SKS)
              </span>

            </div>

            <div className="max-h-72 overflow-y-auto">

              <table className="w-full text-left text-xs">

                <thead className="bg-surface-container text-on-surface-variant font-bold uppercase">

                  <tr>

                    <th className="p-2">
                      Kode
                    </th>

                    <th className="p-2">
                      Mata Kuliah
                    </th>

                    <th className="p-2 text-center">
                      SKS
                    </th>

                    <th className="p-2">
                      Kelas
                    </th>

                    <th className="p-2">
                      Jadwal
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-surface-container">

                  <tr>

                    <td className="p-2 font-mono font-bold">
                      TIF-201
                    </td>

                    <td className="p-2">
                      Kalkulus I
                    </td>

                    <td className="p-2 text-center font-bold">
                      3
                    </td>

                    <td className="p-2">
                      Kelas A
                    </td>

                    <td className="p-2">
                      Senin 08:00 - 10:30
                    </td>

                  </tr>

                  <tr>

                    <td className="p-2 font-mono font-bold">
                      TIF-204
                    </td>

                    <td className="p-2">
                      Pemrograman Web Komprehensif
                    </td>

                    <td className="p-2 text-center font-bold">
                      3
                    </td>

                    <td className="p-2">
                      Kelas C
                    </td>

                    <td className="p-2">
                      Senin 13:00 - 15:30
                    </td>

                  </tr>

                  <tr>

                    <td className="p-2 font-mono font-bold">
                      TIF-206
                    </td>

                    <td className="p-2">
                      Basis Data Relasional Lanjut
                    </td>

                    <td className="p-2 text-center font-bold">
                      4
                    </td>

                    <td className="p-2">
                      Kelas B
                    </td>

                    <td className="p-2">
                      Selasa 09:00 - 11:30
                    </td>

                  </tr>

                  <tr>

                    <td className="p-2 font-mono font-bold">
                      TIF-210
                    </td>

                    <td className="p-2">
                      Jaringan Komputer &amp; Keamanan
                    </td>

                    <td className="p-2 text-center font-bold">
                      3
                    </td>

                    <td className="p-2">
                      Kelas A
                    </td>

                    <td className="p-2">
                      Rabu 10:30 - 13:00
                    </td>

                  </tr>

                  <tr>

                    <td className="p-2 font-mono font-bold">
                      TIF-208
                    </td>

                    <td className="p-2">
                      Struktur Data &amp; Algoritma
                    </td>

                    <td className="p-2 text-center font-bold">
                      4
                    </td>

                    <td className="p-2">
                      Kelas B
                    </td>

                    <td className="p-2">
                      Kamis 08:00 - 10:30
                    </td>

                  </tr>

                  <tr>

                    <td className="p-2 font-mono font-bold">
                      GEN-102
                    </td>

                    <td className="p-2">
                      Etika Profesi &amp; Rekayasa
                    </td>

                    <td className="p-2 text-center font-bold">
                      2
                    </td>

                    <td className="p-2">
                      Kelas B
                    </td>

                    <td className="p-2">
                      Jumat 08:30 - 10:30
                    </td>

                  </tr>

                  <tr>

                    <td className="p-2 font-mono font-bold">
                      UNI-102
                    </td>

                    <td className="p-2">
                      Kewarganegaraan Digital
                    </td>

                    <td className="p-2 text-center font-bold">
                      2
                    </td>

                    <td className="p-2">
                      Kelas A
                    </td>

                    <td className="p-2">
                      Jumat 14:00 - 16:00
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            <div className="flex justify-between items-center pt-2 border-t border-surface-container">

              <span className="text-xs text-on-surface-variant">
                Tercatat di Server PDDikti Kemdikbud
              </span>

              <button
                onClick={() => {
                  window.print();
                  setShowKrsModal(false);
                }}
                className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-xs shadow-sm cursor-pointer"
              >
                Cetak KRS Resmi (PDF)
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL TRANSKRIP
      ===================================================== */}

      {showTranscriptModal && (

        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">

          <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md">

            <div className="flex items-center justify-between border-b border-surface-container pb-2">

              <div>

                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">
                  Transkrip Nilai Kumulatif Sementara
                </span>

                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  Indeks Prestasi Kumulatif: 3.82 (A)
                </h3>

              </div>

              <button
                onClick={() => setShowTranscriptModal(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >

                <span className="material-symbols-outlined">
                  close
                </span>

              </button>

            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">

              <div className="p-2 bg-surface-container-low rounded-lg">

                <span className="text-on-surface-variant block">
                  SKS Lulus
                </span>

                <span className="text-base font-bold text-primary">
                  78 SKS
                </span>

              </div>

              <div className="p-2 bg-surface-container-low rounded-lg">

                <span className="text-on-surface-variant block">
                  Predikat
                </span>

                <span className="text-base font-bold text-tertiary-container">
                  Dengan Pujian
                </span>

              </div>

              <div className="p-2 bg-surface-container-low rounded-lg">

                <span className="text-on-surface-variant block">
                  Sisa Beban
                </span>

                <span className="text-base font-bold text-secondary">
                  66 SKS
                </span>

              </div>

            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">

              Seluruh mata kuliah wajib semester 1 hingga semester 3
              telah lulus dengan nilai rata-rata A dan A-.
              Mata kuliah semester 4 sedang berlangsung.

            </p>

            <div className="flex justify-end gap-2 pt-1">

              <button
                onClick={() => setShowTranscriptModal(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
              >
                Tutup
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL QR PRESENSI
      ===================================================== */}

      {showQrModal && (

        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">

          <div className="bg-surface-container-lowest max-w-sm w-full rounded-2xl p-space-lg shadow-2xl flex flex-col items-center gap-space-md text-center">

            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">

              <span className="material-symbols-outlined text-2xl">
                qr_code_scanner
              </span>

            </div>

            <div>

              <h3 className="font-title-md text-title-md text-primary font-bold">
                Presensi Mandiri QR Mahasiswa
              </h3>

              <p className="text-xs text-on-surface-variant mt-1">
                Arahkan kamera ke layar presentasi dosen di kelas
                Basis Data (Ruang 204).
              </p>

            </div>

            <div className="w-48 h-48 rounded-xl bg-primary flex flex-col items-center justify-center text-on-primary relative overflow-hidden">

              <div className="absolute inset-4 border-2 border-dashed border-tertiary-fixed rounded-lg animate-pulse"></div>

              <span className="material-symbols-outlined text-4xl text-tertiary-fixed">
                center_focus_strong
              </span>

              <span className="text-[11px] text-primary-fixed mt-2">
                Mendeteksi QR Kode...
              </span>

            </div>

            <div className="flex flex-col gap-2 w-full">

              <button
                onClick={() => {
                  setQrCheckedIn(true);
                  setShowQrModal(false);

                  alert(
                    'Check-in Berhasil! Presensi Kehadiran Basis Data Pertemuan 8 tercatat pada 13:04 WIB.'
                  );
                }}
                className="w-full py-2.5 rounded-lg bg-secondary text-on-secondary font-bold text-sm shadow-sm cursor-pointer"
              >
                Simulasikan Pindai QR Sukses
              </button>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 rounded-lg bg-surface-container text-on-surface text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};