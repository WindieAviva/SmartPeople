import React, { useEffect, useMemo, useState } from 'react';
import { ScreenId } from '../types';
import {
  getSessionUser,
  loadAcademicTables,
  lecturerCourses,
  safeNumber,
} from '../services/academicData';
import type { AssignmentItem, Course } from '../types';

interface LecturerDashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

/* =========================================================
   HELPER
========================================================= */

const formatDeadline = (value: any): string => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '-';
  }

  const text = String(value).trim();

  if (
    text.includes('1899') ||
    text.includes('1900')
  ) {
    return '-';
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return text;
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (value: any): string => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return '-';
  }

  const text = String(value).trim();

  if (
    text.includes('1899') ||
    text.includes('1900')
  ) {
    return '-';
  }

  /*
    Jika Google Sheets mengirim format seperti:
    09:30:00
    maka kita ambil HH:mm saja.
  */
  const timeMatch = text.match(
    /(\d{1,2}):(\d{2})/
  );

  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }

  return text;
};

const formatSchedule = (schedule: any): string => {
  if (!schedule) {
    return '-';
  }

  const hari = String(
    schedule.hari || ''
  ).trim();

  const jamMulai = formatTime(
    schedule.jam_mulai
  );

  const jamSelesai = formatTime(
    schedule.jam_selesai
  );

  if (!hari && jamMulai === '-' && jamSelesai === '-') {
    return '-';
  }

  if (
    jamMulai !== '-' &&
    jamSelesai !== '-'
  ) {
    return `${hari} ${jamMulai} - ${jamSelesai}`;
  }

  return `${hari} ${jamMulai !== '-' ? jamMulai : ''}`.trim();
};

const getTodayName = (): string => {
  const days = [
    'Minggu',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ];

  return days[new Date().getDay()];
};

/* =========================================================
   COMPONENT
========================================================= */

export const LecturerDashboardScreen: React.FC<
  LecturerDashboardScreenProps
> = ({ onNavigate }) => {
  const [alertVisible, setAlertVisible] =
    useState(true);

  const [classOpened, setClassOpened] =
    useState(false);

  const [openingClass, setOpeningClass] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [sksFilter, setSksFilter] =
    useState('all');

  const [showQrModal, setShowQrModal] =
    useState(false);

  const [showNewTaskModal, setShowNewTaskModal] =
    useState(false);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [gradingModalData, setGradingModalData] =
    useState<string | null>(null);

  const [courses, setCourses] =
    useState<Course[]>([]);

  const [assignments, setAssignments] =
    useState<AssignmentItem[]>([]);

  /* =====================================================
     DATA DOSEN
  ===================================================== */

  const [lecturer, setLecturer] =
    useState<any | null>(null);

  const [programStudy, setProgramStudy] =
    useState<any | null>(null);

  const [academicTables, setAcademicTables] =
    useState<any | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /* =====================================================
     LOAD DATA GOOGLE SHEETS
  ===================================================== */

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        console.log(
          '================================='
        );
        console.log(
          'MENGAMBIL DATA DASHBOARD DOSEN'
        );
        console.log(
          '================================='
        );

        const tables =
          await loadAcademicTables();

        const session =
          getSessionUser();

        console.log(
          'Session user:',
          session
        );

        const lecturerId =
          session?.reference_id;

        console.log(
          'Reference ID dosen:',
          lecturerId
        );

        if (!lecturerId) {
          console.warn(
            'Reference ID dosen tidak ditemukan.'
          );

          return;
        }

        /*
          ==================================================
          1. CARI DATA DOSEN
          users.reference_id -> dosen.id
          ==================================================
        */

        const foundLecturer =
          tables.dosen.find(
            (d: any) =>
              String(d.id).trim() ===
              String(lecturerId).trim()
          );

        console.log(
          'Dosen yang ditemukan:',
          foundLecturer
        );

        if (foundLecturer) {
          setLecturer(foundLecturer);

          /*
            ==================================================
            2. CARI PROGRAM STUDI
            dosen.prodi_id -> program_studi.id
            ==================================================
          */

          const foundProgramStudy =
            tables.program_studi.find(
              (p: any) =>
                String(p.id).trim() ===
                String(
                  foundLecturer.prodi_id
                ).trim()
            );

          console.log(
            'Program studi:',
            foundProgramStudy
          );

          setProgramStudy(
            foundProgramStudy || null
          );
        }

        /*
          Simpan semua tabel.
        Digunakan untuk statistik dashboard.
        */

        setAcademicTables(tables);

        /*
          ==================================================
          3. CARI KELAS YANG DIAJAR DOSEN
          dosen.id -> kelas.dosen_id
          ==================================================
        */

        const joined =
          lecturerCourses(
            tables,
            lecturerId
          );

        console.log(
          'Kelas yang diampu:',
          joined
        );

        /*
          ==================================================
          4. MAP KELAS KE DATA COURSE
          ==================================================
        */

        const mappedCourses =
          joined.map((c: any) => {
            const classStudents =
              tables.krs.filter(
                (k: any) =>
                  String(k.kelas_id).trim() ===
                  String(c.id).trim()
              ).length;

            const schedule =
              c.jadwal;

            return {
              id: String(c.id),

              code: String(
                c.mataKuliah?.kode || '-'
              ),

              name: String(
                c.mataKuliah?.nama || '-'
              ),

              sks: safeNumber(
                c.mataKuliah?.sks
              ),

              type: String(
                c.mataKuliah?.jenis ||
                  'Wajib Prodi'
              ),

              classSection: String(
                c.nama_kelas || '-'
              ),

              lecturer: String(
                c.dosen?.nama || '-'
              ),

              studentsCount:
                classStudents,

              topic: '-',

              schedule:
                formatSchedule(
                  schedule
                ),

              room: String(
                schedule?.ruangan || '-'
              ),

              imageUrl: '',

              syllabusProgress: 0,

              completedSessions: 0,

              totalSessions: 14,
            };
          });

        setCourses(mappedCourses);

        /*
          ==================================================
          5. AMBIL TUGAS DARI KELAS DOSEN
          ==================================================
        */

        const classIds = new Set(
          joined.map((c: any) =>
            String(c.id).trim()
          )
        );

        const mappedAssignments =
          tables.tugas
            .filter((t: any) =>
              classIds.has(
                String(t.kelas_id).trim()
              )
            )
            .map((t: any) => {
              const c =
                joined.find(
                  (x: any) =>
                    String(x.id).trim() ===
                    String(
                      t.kelas_id
                    ).trim()
                );

              /*
                Semua mahasiswa pada kelas
              */

              const totalStudents =
                tables.krs.filter(
                  (k: any) =>
                    String(
                      k.kelas_id
                    ).trim() ===
                    String(
                      t.kelas_id
                    ).trim()
                ).length;

              /*
                Semua pengumpulan tugas
              */

              const submitted =
                tables.pengumpulan_tugas.filter(
                  (p: any) =>
                    String(
                      p.tugas_id
                    ).trim() ===
                    String(
                      t.id
                    ).trim()
                );

              /*
                Yang belum mempunyai nilai
              */

              const unreviewed =
                submitted.filter(
                  (x: any) =>
                    x.nilai === '' ||
                    x.nilai === null ||
                    x.nilai === undefined
                ).length;

              return {
                id: String(t.id),

                title: String(
                  t.judul || '-'
                ),

                courseName: String(
                  c?.mataKuliah?.nama ||
                    '-'
                ),

                classSection: String(
                  c?.nama_kelas || '-'
                ),

                deadline:
                  formatDeadline(
                    t.deadline
                  ),

                deadlineRelative:
                  formatDeadline(
                    t.deadline
                  ),

                format: 'File',

                submittedCount:
                  submitted.length,

                totalCount:
                  totalStudents,

                unreviewedCount:
                  unreviewed,

                status: 'open',
              };
            });

        setAssignments(
          mappedAssignments as AssignmentItem[]
        );

        console.log(
          'Tugas dosen:',
          mappedAssignments
        );

      } catch (error) {
        console.error(
          'Gagal mengambil data dashboard dosen:',
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  /* =====================================================
     DATA TURUNAN
  ===================================================== */

  const filteredAssignments =
    assignments.filter((item) => {
      const query =
        searchQuery.toLowerCase();

      return (
        item.title
          .toLowerCase()
          .includes(query) ||
        item.courseName
          .toLowerCase()
          .includes(query)
      );
    });

  const filteredCourses =
    courses.filter((course) => {
      if (sksFilter === '3') {
        return course.sks === 3;
      }

      if (sksFilter === '4') {
        return course.sks === 4;
      }

      return true;
    });

  /*
    Total SKS dosen
  */

  const totalSks = useMemo(() => {
    return courses.reduce(
      (total, course) =>
        total +
        safeNumber(course.sks),
      0
    );
  }, [courses]);

  /*
    Total mahasiswa yang terdaftar
    pada seluruh kelas dosen.
  */

  const totalStudents =
    useMemo(() => {
      return courses.reduce(
        (total, course) =>
          total +
          safeNumber(
            course.studentsCount
          ),
        0
      );
    }, [courses]);

  /*
    Jumlah bimbingan dosen
  */

  const mentoringCount =
    useMemo(() => {
      if (
        !academicTables ||
        !lecturer
      ) {
        return 0;
      }

      return (
        academicTables.bimbingan?.filter(
          (b: any) =>
            String(
              b.dosen_id
            ).trim() ===
            String(
              lecturer.id
            ).trim()
        ).length || 0
      );
    }, [
      academicTables,
      lecturer,
    ]);

  /*
    Total tugas yang belum dinilai
  */

  const unreviewedTotal =
    useMemo(() => {
      return assignments.reduce(
        (total, assignment) =>
          total +
          safeNumber(
            assignment.unreviewedCount
          ),
        0
      );
    }, [assignments]);

  /*
    Rata-rata presensi.
    Jika data absensi belum tersedia,
    tampilkan "-".
  */

  const attendanceRate =
    useMemo(() => {
      if (
        !academicTables ||
        !lecturer ||
        courses.length === 0
      ) {
        return null;
      }

      const classIds =
        new Set(
          courses.map((course) =>
            String(course.id).trim()
          )
        );

      const attendanceRecords =
        academicTables.absensi?.filter(
          (a: any) =>
            classIds.has(
              String(
                a.kelas_id
              ).trim()
            )
        ) || [];

      if (
        attendanceRecords.length === 0
      ) {
        return null;
      }

      const hadir =
        attendanceRecords.filter(
          (a: any) => {
            const status =
              String(
                a.status || ''
              )
                .trim()
                .toLowerCase();

            return (
              status === 'hadir' ||
              status === 'present'
            );
          }
        ).length;

      return (
        (hadir /
          attendanceRecords.length) *
        100
      ).toFixed(1);
    }, [
      academicTables,
      lecturer,
      courses,
    ]);

  /*
    Cari jadwal hari ini.
    Jika tidak ada, gunakan jadwal pertama.
  */

  const todayName =
    getTodayName();

  const todayCourses =
    courses.filter((course) =>
      course.schedule
        .toLowerCase()
        .startsWith(
          todayName.toLowerCase()
        )
    );

  const todayCourse =
    todayCourses.length > 0
      ? todayCourses[0]
      : courses[0];

  /* =====================================================
     EVENT
  ===================================================== */

  const handleOpenClass = () => {
    setOpeningClass(true);

    setTimeout(() => {
      setOpeningClass(false);
      setClassOpened(true);
      setShowQrModal(true);
    }, 1000);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="flex flex-col w-full gap-space-lg">

      {/* =================================================
          ALERT
      ================================================= */}

      {alertVisible && (
        <div className="flex items-center justify-between px-space-md py-3 rounded-lg bg-surface-container-high text-on-surface shadow-sm">

          <div className="flex items-center gap-space-sm min-w-0">

            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">

              <span
                className="material-symbols-outlined text-lg"
                style={{
                  fontVariationSettings:
                    "'FILL' 1",
                }}
              >
                notifications_active
              </span>

            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">

              <span className="font-label-md text-label-md text-secondary font-bold">
                Reminder Akademik:
              </span>

              <span className="font-body-md text-body-md text-on-surface truncate">
                Batas akhir penyerahan dan
                input nilai dapat disesuaikan
                dengan jadwal akademik.
              </span>

            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">

            <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-bold">
              Sistem Aktif
            </span>

            <button
              onClick={() =>
                setAlertVisible(false)
              }
              className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
              title="Tutup Notifikasi"
            >
              <span className="material-symbols-outlined text-base">
                close
              </span>
            </button>

          </div>
        </div>
      )}

      {/* =================================================
          LECTURER CONTEXT
      ================================================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-md pb-1">

        <div className="flex flex-col gap-0.5">

          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">

            <span>
              {programStudy?.fakultas ||
                'Fakultas'}
            </span>

            <span>•</span>

            <span>
              Program Studi{' '}
              {programStudy?.nama ||
                '-'}
            </span>

          </div>

          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold flex flex-wrap items-center gap-2">

            <span>
              Dashboard Dosen Pengampu
            </span>

            <span className="text-on-surface-variant font-normal">
              —
            </span>

            <span>
              {isLoading
                ? 'Memuat data...'
                : lecturer?.nama ||
                  'Dosen'}
            </span>

          </h1>

          <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">

            <span className="font-code-sm text-code-sm bg-surface-container px-2 py-0.5 rounded">
              NIDN:{' '}
              {lecturer?.nidn ||
                '-'}
            </span>

            <span>•</span>

            <span className="flex items-center gap-1 text-on-tertiary-container font-label-sm text-label-sm">

              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>

              Tahun Akademik
            </span>

          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="flex items-center flex-wrap gap-2.5">

          <button
            onClick={() =>
              onNavigate(
                'attendance-recap'
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container transition-all font-label-md text-label-md cursor-pointer border border-surface-container"
          >
            <span className="material-symbols-outlined text-lg text-secondary">
              checklist_rtl
            </span>

            <span>
              Rekap Absensi
            </span>
          </button>

          <button
            onClick={() =>
              setShowUploadModal(true)
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container transition-all font-label-md text-label-md cursor-pointer border border-surface-container"
          >
            <span className="material-symbols-outlined text-lg text-secondary">
              upload_file
            </span>

            <span>
              + Unggah Materi
            </span>
          </button>

          <button
            onClick={() =>
              setShowNewTaskModal(true)
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary shadow-md hover:bg-primary-container transition-all font-label-md text-label-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg text-tertiary-fixed">
              post_add
            </span>

            <span>
              + Buat Tugas Baru
            </span>
          </button>

        </div>
      </div>

      {/* =================================================
          METRIC CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">

        {/* CARD 1 */}

        <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container">

          <div className="flex items-center justify-between mb-space-sm">

            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Mata Kuliah Diampu
            </span>

            <div className="w-10 h-10 rounded-lg bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-xl">
                menu_book
              </span>
            </div>

          </div>

          <div className="flex items-baseline gap-2">

            <span className="font-headline-xl text-headline-xl text-primary font-bold">
              {courses.length}
            </span>

            <span className="font-title-md text-title-md text-on-surface-variant">
              Kelas Aktif
            </span>

          </div>

          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-body-sm">

            <span className="text-on-surface-variant">
              Beban SKS: {totalSks}{' '}
              SKS
            </span>

            <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-semibold">
              Terverifikasi
            </span>

          </div>
        </div>

        {/* CARD 2 */}

        <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container">

          <div className="flex items-center justify-between mb-space-sm">

            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Mahasiswa
            </span>

            <div className="w-10 h-10 rounded-lg bg-primary-fixed/60 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">
                groups
              </span>
            </div>

          </div>

          <div className="flex items-baseline gap-2">

            <span className="font-headline-xl text-headline-xl text-primary font-bold">
              {totalStudents}
            </span>

            <span className="font-title-md text-title-md text-on-surface-variant">
              Terdaftar
            </span>

          </div>

          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-body-sm">

            <span className="text-on-surface-variant">
              {mentoringCount}{' '}
              Bimbingan
            </span>

            <span className="flex items-center text-on-tertiary-container font-label-sm text-label-sm font-semibold">
              <span className="material-symbols-outlined text-sm">
                groups
              </span>
              Data Akademik
            </span>

          </div>
        </div>

        {/* CARD 3 */}

        <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container">

          <div className="flex items-center justify-between mb-space-sm">

            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Tugas Masuk
            </span>

            <div className="w-10 h-10 rounded-lg bg-error-container/60 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-xl">
                pending_actions
              </span>
            </div>

          </div>

          <div className="flex items-baseline gap-2">

            <span className="font-headline-xl text-headline-xl text-primary font-bold">
              {unreviewedTotal}
            </span>

            <span className="font-title-md text-title-md text-on-surface-variant">
              Perlu Dinilai
            </span>

          </div>

          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-body-sm">

            <span className="text-on-surface-variant">
              {assignments.length}{' '}
              tugas aktif
            </span>

            {unreviewedTotal > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                Perlu Perhatian
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold">
                Aman
              </span>
            )}

          </div>
        </div>

        {/* CARD 4 */}

        <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow border border-surface-container">

          <div className="flex items-center justify-between mb-space-sm">

            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Rata-rata Presensi
            </span>

            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/60 flex items-center justify-center text-on-tertiary-container">
              <span className="material-symbols-outlined text-xl">
                fact_check
              </span>
            </div>

          </div>

          <div className="flex items-baseline gap-2">

            <span className="font-headline-xl text-headline-xl text-primary font-bold">
              {attendanceRate !== null
                ? `${attendanceRate}%`
                : '-'}
            </span>

            <span className="font-title-md text-title-md text-on-tertiary-container font-semibold">
              {attendanceRate !== null
                ? 'Tercatat'
                : 'Belum Ada Data'}
            </span>

          </div>

          <div className="mt-space-sm pt-space-xs flex items-center justify-between text-body-sm">

            <span className="text-on-surface-variant">
              Berdasarkan absensi
            </span>

            <span className="flex items-center text-on-tertiary-container font-label-sm text-label-sm font-semibold">

              <span className="material-symbols-outlined text-sm">
                fact_check
              </span>

              Google Sheets

            </span>

          </div>
        </div>

      </div>

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">

        {/* =================================================
            COURSES
        ================================================= */}

        <div className="xl:col-span-8 flex flex-col gap-space-md">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <span className="material-symbols-outlined text-secondary text-2xl">
                auto_stories
              </span>

              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Mata Kuliah Semester Ini
              </h2>

            </div>

            <div className="flex items-center gap-2">

              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Filter SKS:
              </span>

              <select
                value={sksFilter}
                onChange={(e) =>
                  setSksFilter(
                    e.target.value
                  )
                }
                className="bg-surface-container-lowest text-on-surface px-3 py-1 rounded-lg font-label-sm text-label-sm focus:outline-none border border-surface-container cursor-pointer"
              >
                <option value="all">
                  Semua ({courses.length}{' '}
                  Matkul)
                </option>

                <option value="3">
                  3 SKS
                </option>

                <option value="4">
                  4 SKS
                </option>
              </select>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">

            {filteredCourses.length === 0 ? (

              <div className="md:col-span-2 p-space-lg rounded-xl bg-surface-container-lowest border border-surface-container text-center">

                <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                  menu_book
                </span>

                <p className="mt-2 text-on-surface-variant">
                  Belum ada kelas yang
                  diampu dosen ini.
                </p>

              </div>

            ) : (

              filteredCourses.map(
                (c) => (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between p-space-lg rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all group border border-surface-container"
                  >

                    <div className="flex flex-col gap-space-sm">

                      <div className="flex items-start justify-between gap-2">

                        <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-bold">
                          {c.code} •{' '}
                          {c.sks} SKS
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          {c.classSection}
                        </span>

                      </div>

                      <div>

                        <h3 className="font-title-md text-title-md text-primary font-bold group-hover:text-secondary transition-colors">
                          {c.name}
                        </h3>

                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {c.studentsCount}{' '}
                          Mahasiswa
                          Terdaftar
                        </p>

                      </div>

                      <div className="flex items-center gap-3 pt-2">

                        <div className="w-14 h-14 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary shrink-0">

                          <span className="material-symbols-outlined text-2xl">
                            menu_book
                          </span>

                        </div>

                        <div className="flex-1 flex flex-col gap-1.5">

                          <div className="flex justify-between font-label-sm text-label-sm">

                            <span className="text-on-surface-variant">
                              Silabus Selesai
                            </span>

                            <span className="text-primary font-bold">
                              {c.syllabusProgress}%
                            </span>

                          </div>

                          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">

                            <div
                              className="h-full bg-secondary rounded-full transition-all duration-700"
                              style={{
                                width: `${c.syllabusProgress}%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>

                    </div>

                    <div className="pt-space-md mt-space-sm flex items-center justify-between border-t border-surface-container/60">

                      <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">

                        <span className="material-symbols-outlined text-sm text-tertiary-fixed-dim">
                          schedule
                        </span>

                        {c.schedule}

                      </span>

                      <button
                        onClick={() =>
                          onNavigate(
                            'course-detail'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-secondary hover:text-on-secondary text-primary font-label-sm text-label-sm transition-colors flex items-center gap-1 cursor-pointer"
                      >

                        <span>
                          Kelola Kelas
                        </span>

                        <span className="material-symbols-outlined text-sm">
                          arrow_forward
                        </span>

                      </button>

                    </div>

                  </div>
                )
              )

            )}

          </div>

        </div>

        {/* =================================================
            SCHEDULE
        ================================================= */}

        <div className="xl:col-span-4 flex flex-col gap-space-md">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <span className="material-symbols-outlined text-secondary text-2xl">
                event_available
              </span>

              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Jadwal Mengajar
              </h2>

            </div>

            <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold">
              {todayName}
            </span>

          </div>

          <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-lowest shadow-sm gap-space-md relative overflow-hidden border border-surface-container">

            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-tertiary-fixed-dim" />

            <div className="flex items-center justify-between pt-1">

              <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary font-label-sm text-label-sm font-bold flex items-center gap-1">

                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />

                {classOpened
                  ? 'Sesi Kelas Aktif'
                  : 'Jadwal Kelas'}

              </span>

              <span className="font-code-sm text-code-sm text-on-surface-variant">
                {todayCourse?.schedule
                  ?.replace(
                    `${todayName} `,
                    ''
                  ) || '-'}
              </span>

            </div>

            <div>

              <h3 className="font-headline-md text-headline-md text-primary font-bold">
                {todayCourse?.name ||
                  'Tidak ada jadwal'}
              </h3>

              <p className="font-body-md text-body-md text-on-surface-variant">
                Kelas{' '}
                {todayCourse?.classSection ||
                  '-'}
              </p>

            </div>

            <div className="grid grid-cols-2 gap-space-sm p-3 rounded-lg bg-surface-container-low text-body-sm">

              <div className="flex flex-col">

                <span className="text-on-surface-variant font-label-sm text-label-sm">
                  Ruang Kuliah
                </span>

                <span className="text-primary font-semibold flex items-center gap-1 mt-0.5 text-xs">

                  <span className="material-symbols-outlined text-base text-secondary">
                    meeting_room
                  </span>

                  {todayCourse?.room ||
                    '-'}

                </span>

              </div>

              <div className="flex flex-col">

                <span className="text-on-surface-variant font-label-sm text-label-sm">
                  Mata Kuliah
                </span>

                <span className="text-primary font-semibold flex items-center gap-1 mt-0.5 text-xs">

                  <span className="material-symbols-outlined text-base text-tertiary-fixed-dim">
                    topic
                  </span>

                  {todayCourse?.code ||
                    '-'}

                </span>

              </div>

            </div>

            <button
              onClick={handleOpenClass}
              disabled={
                openingClass ||
                !todayCourse
              }
              className={`w-full py-3 px-4 rounded-lg transition-all font-label-md text-label-md flex items-center justify-center gap-2 shadow-sm font-bold cursor-pointer ${
                classOpened
                  ? 'bg-tertiary-container text-tertiary-fixed'
                  : 'bg-secondary text-on-secondary hover:bg-secondary-container'
              }`}
            >

              {openingClass ? (
                <>
                  <span className="material-symbols-outlined text-xl animate-spin">
                    refresh
                  </span>

                  <span>
                    Membuka Sesi
                    Presensi QR...
                  </span>
                </>
              ) : classOpened ? (
                <>
                  <span className="material-symbols-outlined text-xl">
                    check_circle
                  </span>

                  <span>
                    Sesi Kelas Aktif
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">
                    co_present
                  </span>

                  <span>
                    Buka Kelas &
                    Catat Absensi
                  </span>
                </>
              )}

            </button>

            <div className="flex items-center justify-between text-body-sm pt-2 border-t border-surface-container">

              <div className="flex items-center gap-1.5">

                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />

                <span className="text-on-surface-variant">
                  Mahasiswa:
                </span>

                <span className="font-bold text-primary">
                  {todayCourse?.studentsCount ||
                    0}
                </span>

              </div>

              <button
                onClick={() =>
                  setShowQrModal(true)
                }
                className="text-secondary hover:underline font-label-sm text-label-sm font-semibold cursor-pointer"
              >
                Lihat QR Presensi
              </button>

            </div>

          </div>

          {/* UPCOMING */}

          <div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm gap-space-sm border border-surface-container">

            <div className="flex items-center justify-between">

              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                Kelas Diampu
              </span>

              <span className="font-code-sm text-code-sm text-on-surface-variant">
                {courses.length}{' '}
                Kelas
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex flex-col">

                <span className="font-title-md text-title-md text-primary font-bold">
                  {courses[1]?.name ||
                    'Tidak ada kelas berikutnya'}
                </span>

                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {courses[1]
                    ? `Kelas ${courses[1].classSection} • ${courses[1].schedule}`
                    : 'Data jadwal belum tersedia'}
                </span>

              </div>

              <button
                onClick={() =>
                  onNavigate(
                    'student-advising'
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
              >
                Detail
              </button>

            </div>

          </div>

          {/* ATTENDANCE INFO */}

          <div className="p-space-md rounded-xl bg-primary text-on-primary flex items-center justify-between shadow-sm">

            <div className="flex flex-col">

              <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider font-bold">
                Status Data Akademik
              </span>

              <span className="font-headline-md text-headline-md text-on-primary font-bold mt-1">
                Terhubung
              </span>

              <span className="font-body-sm text-body-sm text-on-primary-container">
                Data dashboard berasal
                dari Google Sheets.
              </span>

            </div>

            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-tertiary-fixed shrink-0">

              <span className="material-symbols-outlined text-2xl">
                verified
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          ASSIGNMENTS
      ================================================= */}

      <div className="flex flex-col gap-space-md">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-sm">

          <div className="flex items-center gap-2">

            <span className="material-symbols-outlined text-secondary text-2xl">
              assignment_late
            </span>

            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              Tugas Masuk &amp;
              Menunggu Penilaian
            </h2>

            <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
              {unreviewedTotal}{' '}
              Belum Dinilai
            </span>

          </div>

          <div className="flex items-center gap-2">

            <div className="relative">

              <span className="material-symbols-outlined absolute left-3 top-2 text-on-surface-variant text-lg">
                search
              </span>

              <input
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                className="bg-surface-container-lowest text-on-surface pl-9 pr-3 py-1.5 rounded-lg font-body-sm text-body-sm focus:outline-none w-56 shadow-sm border border-surface-container"
                placeholder="Cari tugas / judul..."
                type="text"
              />

            </div>

            <button
              onClick={() =>
                setSearchQuery('')
              }
              className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container font-label-sm text-label-sm text-primary shadow-sm flex items-center gap-1 cursor-pointer border border-surface-container"
            >

              <span className="material-symbols-outlined text-sm">
                filter_list
              </span>

              <span>
                Reset
              </span>

            </button>

          </div>

        </div>

        {/* TABLE */}

        <div className="w-full rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden border border-surface-container">

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">

                  <th className="py-3 px-space-md">
                    Judul Tugas
                  </th>

                  <th className="py-3 px-space-md">
                    Mata Kuliah
                  </th>

                  <th className="py-3 px-space-md">
                    Tenggat Waktu
                  </th>

                  <th className="py-3 px-space-md">
                    Jumlah Submit
                  </th>

                  <th className="py-3 px-space-md">
                    Status Evaluasi
                  </th>

                  <th className="py-3 px-space-md text-right">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-surface-container text-body-md">

                {filteredAssignments.length ===
                0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="py-10 text-center text-on-surface-variant"
                    >

                      <span className="material-symbols-outlined text-4xl">
                        assignment
                      </span>

                      <p className="mt-2">
                        Belum ada tugas
                        untuk kelas
                        dosen ini.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredAssignments.map(
                    (task) => {

                      const percentage =
                        task.totalCount >
                        0
                          ? Math.round(
                              (task.submittedCount /
                                task.totalCount) *
                                100
                            )
                          : 0;

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-surface-container-low/60 transition-colors"
                        >

                          <td className="py-3.5 px-space-md">

                            <div className="flex flex-col">

                              <span className="font-title-md text-title-md text-primary font-bold">
                                {task.title}
                              </span>

                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                {task.format}
                              </span>

                            </div>

                          </td>

                          <td className="py-3.5 px-space-md">

                            <div className="flex flex-col">

                              <span className="font-label-md text-label-md text-on-surface font-semibold">
                                {task.courseName}
                              </span>

                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                {task.classSection}
                              </span>

                            </div>

                          </td>

                          <td className="py-3.5 px-space-md">

                            <span className="font-label-sm text-label-sm font-bold text-on-surface">
                              {task.deadline}
                            </span>

                          </td>

                          <td className="py-3.5 px-space-md">

                            <div className="flex items-center gap-2">

                              <div className="flex flex-col">

                                <span className="font-label-md text-label-md text-primary font-bold">
                                  {
                                    task.submittedCount
                                  }{' '}
                                  /{' '}
                                  {
                                    task.totalCount
                                  }
                                </span>

                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {percentage}%
                                  Kumpul
                                </span>

                              </div>

                              <div className="w-12 h-1.5 rounded-full bg-surface-container overflow-hidden">

                                <div
                                  className="h-full bg-secondary rounded-full"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                          <td className="py-3.5 px-space-md">

                            {task.unreviewedCount >
                            0 ? (

                              <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-semibold inline-flex items-center gap-1">

                                <span className="w-1.5 h-1.5 rounded-full bg-error" />

                                {
                                  task.unreviewedCount
                                }{' '}
                                Belum
                                Dinilai

                              </span>

                            ) : (

                              <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed-variant font-label-sm text-label-sm font-semibold inline-flex items-center gap-1">

                                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim" />

                                Selesai

                              </span>

                            )}

                          </td>

                          <td className="py-3.5 px-space-md text-right">

                            {task.unreviewedCount >
                            0 ? (

                              <button
                                onClick={() =>
                                  setGradingModalData(
                                    task.title
                                  )
                                }
                                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-secondary font-label-sm text-label-sm font-bold transition-all shadow-sm cursor-pointer"
                              >
                                Input Nilai
                              </button>

                            ) : (

                              <button
                                onClick={() =>
                                  onNavigate(
                                    'gradebook'
                                  )
                                }
                                className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-variant text-on-surface-variant font-label-sm text-label-sm font-semibold transition-all cursor-pointer"
                              >
                                Rekap Nilai
                              </button>

                            )}

                          </td>

                        </tr>
                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

          <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm text-body-sm">

            <span className="text-on-surface-variant">
              Menampilkan{' '}
              {filteredAssignments.length}{' '}
              dari {assignments.length}{' '}
              tugas
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          MODAL QR
      ================================================= */}

      {showQrModal && (

        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">

          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-space-lg shadow-2xl flex flex-col items-center gap-space-md">

            <div className="flex items-center justify-between w-full">

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined text-secondary text-2xl">
                  qr_code_scanner
                </span>

                <span className="font-title-md text-title-md text-primary font-bold">
                  QR Presensi
                </span>

              </div>

              <button
                onClick={() =>
                  setShowQrModal(false)
                }
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>

            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-dashed border-secondary flex flex-col items-center">

              <div className="w-52 h-52 bg-surface-container-lowest p-3 rounded-lg shadow-inner flex flex-col items-center justify-center relative">

                <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-primary/90 rounded">

                  {Array.from({
                    length: 36,
                  }).map((_, i) => (

                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i * 7 + 3) %
                          4 ===
                        0
                          ? 'bg-surface-container-lowest'
                          : (i * 3) %
                              5 ===
                            0
                          ? 'bg-secondary'
                          : 'bg-primary'
                      }`}
                    />

                  ))}

                </div>

              </div>

              <span className="font-code-sm text-code-sm text-secondary font-bold mt-3">
                KODE SESI
              </span>

              <span className="text-xs text-on-surface-variant mt-0.5">
                Simulasi presensi
              </span>

            </div>

            <div className="w-full bg-surface-container-low p-3 rounded-lg text-xs text-on-surface-variant flex items-center justify-between">

              <span>
                Mahasiswa:{' '}
                <strong>
                  {todayCourse?.studentsCount ||
                    0}
                </strong>
              </span>

              <span className="text-tertiary-container font-bold flex items-center gap-1">

                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-ping" />

                Live

              </span>

            </div>

            <button
              onClick={() =>
                setShowQrModal(false)
              }
              className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold cursor-pointer"
            >
              Tutup Jendela QR
            </button>

          </div>

        </div>
      )}

      {/* =================================================
          MODAL INPUT NILAI
      ================================================= */}

      {gradingModalData && (

        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">

          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md">

            <div className="flex items-center justify-between">

              <div>

                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">
                  Input Nilai
                </span>

                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  {gradingModalData}
                </h3>

              </div>

              <button
                onClick={() =>
                  setGradingModalData(
                    null
                  )
                }
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>

            </div>

            <p className="text-body-sm text-on-surface-variant">
              Terdapat submission
              mahasiswa yang belum
              dinilai. Fitur penyimpanan
              nilai akan dihubungkan ke
              tabel nilai.
            </p>

            <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-2">

              <div className="flex justify-between items-center text-sm font-semibold">

                <span>
                  Input Nilai
                </span>

              </div>

              <div className="flex items-center gap-3 mt-1">

                <label className="text-xs text-on-surface-variant">
                  Skor (0-100):
                </label>

                <input
                  defaultValue="0"
                  type="number"
                  min="0"
                  max="100"
                  className="w-20 px-3 py-1.5 rounded bg-surface-container-lowest border border-surface-container text-center font-bold text-primary"
                />

                <input
                  placeholder="Catatan untuk mahasiswa..."
                  type="text"
                  className="flex-1 px-3 py-1.5 rounded bg-surface-container-lowest border border-surface-container text-xs"
                />

              </div>

            </div>

            <div className="flex items-center justify-end gap-2 pt-2">

              <button
                onClick={() =>
                  setGradingModalData(
                    null
                  )
                }
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  alert(
                    'Form nilai siap dihubungkan ke tabel nilai Google Sheets.'
                  );

                  setGradingModalData(
                    null
                  );
                }}
                className="px-5 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold shadow-sm cursor-pointer"
              >
                Simpan
              </button>

              <button
                onClick={() => {
                  setGradingModalData(
                    null
                  );

                  onNavigate(
                    'gradebook'
                  );
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm cursor-pointer"
              >
                Buka Gradebook
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          MODAL BUAT TUGAS
      ================================================= */}

      {showNewTaskModal && (

        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">

          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined text-secondary text-2xl">
                  post_add
                </span>

                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  Buat Penugasan Baru
                </h3>

              </div>

              <button
                onClick={() =>
                  setShowNewTaskModal(
                    false
                  )
                }
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>

            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                alert(
                  'Form tugas siap dihubungkan ke tabel tugas Google Sheets.'
                );

                setShowNewTaskModal(
                  false
                );
              }}
              className="flex flex-col gap-3 text-body-md"
            >

              <div>

                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Mata Kuliah
                </label>

                <select className="w-full p-2 rounded-lg bg-surface-container-low border border-surface-container text-sm">

                  {courses.length ===
                  0 ? (

                    <option>
                      Belum ada kelas
                    </option>

                  ) : (

                    courses.map(
                      (course) => (
                        <option
                          key={
                            course.id
                          }
                        >
                          {course.code}{' '}
                          {
                            course.name
                          }{' '}
                          (Kelas{' '}
                          {
                            course.classSection
                          })
                        </option>
                      )
                    )

                  )}

                </select>

              </div>

              <div>

                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Judul Tugas
                </label>

                <input
                  required
                  placeholder="Masukkan judul tugas..."
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-surface-container text-sm"
                />

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Deadline
                  </label>

                  <input
                    type="date"
                    required
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-surface-container text-sm"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-on-surface-variant mb-1">
                    Bobot (%)
                  </label>

                  <input
                    type="number"
                    defaultValue="15"
                    max="100"
                    className="w-full p-2 rounded-lg bg-surface-container-low border border-surface-container text-sm"
                  />

                </div>

              </div>

              <div>

                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Instruksi
                </label>

                <textarea
                  rows={3}
                  placeholder="Tuliskan petunjuk pengerjaan..."
                  className="w-full p-2 rounded-lg bg-surface-container-low border border-surface-container text-sm"
                />

              </div>

              <div className="flex justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowNewTaskModal(
                      false
                    )
                  }
                  className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm cursor-pointer"
                >
                  Terbitkan Tugas
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          MODAL UPLOAD MATERI
      ================================================= */}

      {showUploadModal && (

        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">

          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-space-lg shadow-2xl flex flex-col gap-space-md">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">

                <span className="material-symbols-outlined text-secondary text-2xl">
                  upload_file
                </span>

                <h3 className="font-headline-md text-headline-md text-primary font-bold">
                  Unggah Materi Kuliah
                </h3>

              </div>

              <button
                onClick={() =>
                  setShowUploadModal(
                    false
                  )
                }
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>

            </div>

            <div className="p-6 border-2 border-dashed border-secondary/40 rounded-xl bg-surface-container-low text-center flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container transition-colors">

              <span className="material-symbols-outlined text-secondary text-4xl mb-1">
                cloud_upload
              </span>

              <span className="font-label-md text-label-md text-primary font-bold">
                Pilih Berkas Slide /
                PDF
              </span>

              <span className="text-xs text-on-surface-variant mt-1">
                Maksimal ukuran
                berkas 50 MB
              </span>

            </div>

            <div className="flex justify-end gap-2 pt-1">

              <button
                onClick={() =>
                  setShowUploadModal(
                    false
                  )
                }
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  alert(
                    'Form upload materi siap dihubungkan ke tabel materi Google Sheets.'
                  );

                  setShowUploadModal(
                    false
                  );
                }}
                className="px-5 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold shadow-sm cursor-pointer"
              >
                Unggah Sekarang
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};