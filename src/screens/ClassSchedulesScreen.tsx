import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';
import {
  loadAcademicTables,
  joinCourse,
  getSessionUser,
} from '../services/academicData';
import type { ScheduleEvent } from '../types';

interface ClassSchedulesScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const ClassSchedulesScreen: React.FC<ClassSchedulesScreenProps> = ({
  onNavigate,
}) => {
  const [selectedDay, setSelectedDay] =
    useState<string>('Senin');

  const [selectedRoomType, setSelectedRoomType] =
    useState<string>('ALL');

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [events, setEvents] =
    useState<ScheduleEvent[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);


  /* =====================================================
     LOAD JADWAL
  ===================================================== */

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        /* ---------------------------------------------
           Ambil semua tabel akademik
        --------------------------------------------- */

        const tables =
          await loadAcademicTables();


        /* ---------------------------------------------
           Ambil user yang sedang login
        --------------------------------------------- */

        const sessionUser =
          getSessionUser();


        const userRole =
          sessionUser?.role;


        const referenceId =
          String(
            sessionUser?.reference_id || ''
          ).trim();


        /* ---------------------------------------------
           Tentukan kelas yang boleh ditampilkan
        --------------------------------------------- */

        let allowedClassIds: string[] | null =
          null;


        /*
          Jika mahasiswa:
          tampilkan hanya kelas yang ada
          di KRS mahasiswa tersebut.
        */

        if (
          userRole === 'mahasiswa' ||
          userRole === 'student'
        ) {

          const student = tables.mahasiswa.find(
            (m) =>
              String(m.id).trim() ===
              referenceId
          );


          if (student) {

            allowedClassIds =
              tables.krs
                .filter(
                  (krs) =>
                    String(
                      krs.mahasiswa_id
                    ).trim() ===
                    String(
                      student.id
                    ).trim()
                )
                .map(
                  (krs) =>
                    String(
                      krs.kelas_id
                    ).trim()
                );

          } else {

            allowedClassIds = [];

          }
        }


        /*
          Jika dosen:
          tampilkan hanya kelas yang diampu
          oleh dosen tersebut.
        */

        if (
          userRole === 'dosen' ||
          userRole === 'lecturer'
        ) {

          const lecturer =
            tables.dosen.find(
              (d) =>
                String(d.id).trim() ===
                referenceId
            );


          if (lecturer) {

            const lecturerClasses =
              tables.kelas
                .filter(
                  (kelas) =>
                    String(
                      kelas.dosen_id
                    ).trim() ===
                    String(
                      lecturer.id
                    ).trim()
                )
                .map(
                  (kelas) =>
                    String(
                      kelas.id
                    ).trim()
                );


            allowedClassIds =
              lecturerClasses;

          } else {

            allowedClassIds = [];

          }
        }


        /* ---------------------------------------------
           Mapping jadwal
        --------------------------------------------- */

        const mapped =
          tables.jadwal
            .filter((jadwal) => {

              /*
                Admin dapat melihat semua jadwal.
                Mahasiswa/dosen hanya jadwal
                yang berhubungan dengan mereka.
              */

              if (
                allowedClassIds === null
              ) {
                return true;
              }


              return allowedClassIds.includes(
                String(
                  jadwal.kelas_id
                ).trim()
              );

            })
            .map((jadwal) => {

              /* Cari kelas */

              const kelas =
                tables.kelas.find(
                  (k) =>
                    String(k.id).trim() ===
                    String(
                      jadwal.kelas_id
                    ).trim()
                );


              /* Gabungkan dengan mata kuliah + dosen */

              const course =
                joinCourse(
                  tables,
                  kelas
                );


              /* Hitung mahasiswa dalam kelas */

              const studentsCount =
                tables.krs.filter(
                  (k) =>
                    String(
                      k.kelas_id
                    ).trim() ===
                    String(
                      jadwal.kelas_id
                    ).trim()
                ).length;


              /* Ruangan */

              const room =
                String(
                  jadwal.ruangan || '-'
                );


              /* Tentukan tipe ruangan */

              let roomType:
                | 'lab'
                | 'auditorium'
                | 'theory' =
                'theory';


              if (
                /lab/i.test(room)
              ) {

                roomType = 'lab';

              } else if (
                /aula/i.test(room) ||
                /auditorium/i.test(room)
              ) {

                roomType =
                  'auditorium';

              }


              return {
                id: String(
                  jadwal.id
                ),

                courseCode:
                  String(
                    course.mataKuliah
                      ?.kode || '-'
                  ),

                courseName:
                  String(
                    course.mataKuliah
                      ?.nama || '-'
                  ),

                classSection:
                  String(
                    course.nama_kelas ||
                    '-'
                  ),

                lecturer:
                  String(
                    course.dosen?.nama ||
                    '-'
                  ),

                day:
                  String(
                    jadwal.hari ||
                    'Senin'
                  ) as ScheduleEvent['day'],

                startTime:
                  String(
                    jadwal.jam_mulai ||
                    '-'
                  ),

                endTime:
                  String(
                    jadwal.jam_selesai ||
                    '-'
                  ),

                room,

                roomType,

                type: 'Teori',

                studentsCount,

                status: 'upcoming',

              } as ScheduleEvent;

            });


        setEvents(mapped);

      } catch (error) {

        console.error(
          'Gagal mengambil jadwal:',
          error
        );

        setEvents([]);

      } finally {

        setIsLoading(false);

      }
    };


    load();

  }, []);


  /* =====================================================
     TOAST
  ===================================================== */

  const triggerToast = (
    msg: string
  ) => {

    setToastMessage(msg);

    setTimeout(
      () => setToastMessage(null),
      3500
    );

  };


  /* =====================================================
     DAYS
  ===================================================== */

  const days = [
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu',
  ];


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredEvents =
    events.filter((ev) => {

      const matchesDay =
        selectedDay === 'ALL' ||
        ev.day === selectedDay;


      const matchesRoom =
        selectedRoomType === 'ALL' ||
        ev.roomType ===
          selectedRoomType;


      return (
        matchesDay &&
        matchesRoom
      );

    });


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div className="space-y-6">


      {/* =================================================
          TOAST
      ================================================= */}

      {toastMessage && (

        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-bounce">

          <span className="material-symbols-outlined text-emerald-400 text-xl">
            check_circle
          </span>

          <span className="text-sm font-medium">
            {toastMessage}
          </span>

        </div>

      )}


      {/* =================================================
          HEADER BANNER
      ================================================= */}

      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">

            <span className="material-symbols-outlined text-base">
              calendar_month
            </span>

            Jadwal Perkuliahan & Manajemen Ruangan

          </div>


          <h1 className="text-2xl font-bold text-on-surface">
            Jadwal Kuliah Mingguan & Kalender Akademik
          </h1>


          <p className="text-sm text-on-surface-variant mt-1">
            Alokasi ruang kuliah teori & laboratorium komputer,
            verifikasi bentrok jam tatap muka, dan koordinasi
            kuliah pengganti.
          </p>

        </div>


        <div className="flex items-center gap-2.5 flex-wrap">

          <button
            onClick={() =>
              triggerToast(
                'Jadwal kuliah berhasil disinkronkan ke kalender perangkat!'
              )
            }
            className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >

            <span className="material-symbols-outlined text-base">
              event
            </span>

            Ekspor iCal / Google Cal

          </button>


          <button
            onClick={() =>
              setShowAddModal(true)
            }
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
          >

            <span className="material-symbols-outlined text-base">
              add_circle
            </span>

            Jadwalkan Kuliah Pengganti

          </button>

        </div>

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {isLoading ? (

        <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high">

          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>

          <p className="text-sm font-semibold text-on-surface mt-3">
            Memuat jadwal dari Google Sheets...
          </p>

        </div>

      ) : (

        <>


          {/* =============================================
              DAYS
          ============================================= */}

          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-surface-container-high">

            {days.map((day) => (

              <button
                key={day}
                onClick={() =>
                  setSelectedDay(day)
                }
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-primary text-white shadow'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >

                {day}

              </button>

            ))}

          </div>


          {/* =============================================
              FILTER
          ============================================= */}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <span className="text-xs font-semibold text-on-surface-variant">
                Tipe Ruangan:
              </span>


              <select
                value={selectedRoomType}
                onChange={(e) =>
                  setSelectedRoomType(
                    e.target.value
                  )
                }
                className="px-3.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface cursor-pointer"
              >

                <option value="ALL">
                  Semua Ruangan
                </option>

                <option value="lab">
                  Laboratorium Komputer Saja
                </option>

                <option value="theory">
                  Ruang Teori Saja
                </option>

              </select>

            </div>


            <div className="text-xs text-on-surface-variant">

              Menampilkan{' '}

              <span className="font-bold text-on-surface">
                {filteredEvents.length} sesi perkuliahan
              </span>{' '}

              pada hari {selectedDay}

            </div>

          </div>


          {/* =============================================
              SCHEDULE LIST
          ============================================= */}

          <div className="space-y-4">

            {filteredEvents.length === 0 ? (

              <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-surface-container-high text-on-surface-variant">

                <span className="material-symbols-outlined text-4xl mb-2 text-slate-400">
                  event_busy
                </span>

                <div className="font-semibold text-sm">
                  Tidak ada jadwal perkuliahan pada hari ini.
                </div>

                <p className="text-xs mt-1">
                  Gunakan hari ini untuk riset mandiri
                  atau konsultasi bimbingan akademik.
                </p>

              </div>

            ) : (

              filteredEvents.map((ev) => {

                const isCompleted =
                  ev.status ===
                  'completed';

                const isOngoing =
                  ev.status ===
                  'ongoing';


                return (

                  <div
                    key={ev.id}
                    className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/50 transition-all"
                  >


                    {/* TIME + INFORMATION */}

                    <div className="flex items-start gap-4">


                      {/* TIME */}

                      <div className="w-28 p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-center shrink-0">

                        <span className="text-xs font-bold text-primary block">
                          {ev.startTime}
                        </span>

                        <span className="text-[10px] text-on-surface-variant block">
                          s/d
                        </span>

                        <span className="text-xs font-bold text-on-surface block">
                          {ev.endTime}
                        </span>

                      </div>


                      {/* COURSE */}

                      <div className="space-y-1">

                        <div className="flex items-center gap-2 flex-wrap">

                          <span className="font-mono text-xs font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded">
                            {ev.courseCode}
                          </span>

                          <h3 className="font-bold text-base text-on-surface">
                            {ev.courseName}
                          </h3>

                          <span className="text-xs font-semibold text-on-surface-variant">
                            ({ev.classSection})
                          </span>

                        </div>


                        <p className="text-xs text-on-surface-variant font-medium">

                          Dosen:{' '}

                          <span className="text-on-surface">
                            {ev.lecturer}
                          </span>

                        </p>


                        <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-1 flex-wrap">

                          <span className="flex items-center gap-1 font-semibold text-on-surface">

                            <span className="material-symbols-outlined text-sm text-primary">
                              location_on
                            </span>

                            {ev.room}

                          </span>


                          <span className="flex items-center gap-1">

                            <span className="material-symbols-outlined text-sm">
                              groups
                            </span>

                            {ev.studentsCount} Mahasiswa

                          </span>


                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container text-on-surface-variant">

                            {ev.type}

                          </span>

                        </div>

                      </div>

                    </div>


                    {/* STATUS */}

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">

                      <span
                        className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-700'
                            : isOngoing
                            ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                            : 'bg-primary-container text-on-primary-container'
                        }`}
                      >

                        {isCompleted
                          ? 'Selesai'
                          : isOngoing
                          ? 'Sedang Berlangsung'
                          : 'Akan Datang'}

                      </span>


                      <button
                        onClick={() =>
                          onNavigate(
                            'attendance-recap'
                          )
                        }
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >

                        Presensi Kelas

                        <span className="material-symbols-outlined text-sm">
                          chevron_right
                        </span>

                      </button>

                    </div>

                  </div>

                );

              })

            )}

          </div>

        </>

      )}


      {/* =================================================
          ADD REPLACEMENT CLASS MODAL
      ================================================= */}

      {showAddModal && (

        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">

          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-6 border border-surface-container-high shadow-2xl relative space-y-4">


            {/* CLOSE */}

            <button
              onClick={() =>
                setShowAddModal(false)
              }
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition cursor-pointer"
            >

              <span className="material-symbols-outlined text-xl">
                close
              </span>

            </button>


            {/* TITLE */}

            <div>

              <h2 className="text-lg font-bold text-on-surface">
                Jadwalkan Kuliah Pengganti
              </h2>

              <p className="text-xs text-on-surface-variant">
                Pastikan ruangan tidak berbenturan dengan kelas lain
              </p>

            </div>


            {/* FORM */}

            <form
              onSubmit={(e) => {

                e.preventDefault();

                setShowAddModal(false);

                triggerToast(
                  'Jadwal kuliah pengganti berhasil dibuat dan diumumkan ke mahasiswa.'
                );

              }}

              className="space-y-3 text-xs"
            >


              {/* MATA KULIAH */}

              <div>

                <label className="block font-semibold text-on-surface mb-1">
                  Mata Kuliah
                </label>

                <select className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface">

                  <option>
                    TIF-204 Pemrograman Web (Kelas A)
                  </option>

                  <option>
                    IF-2204 Struktur Data (Kelas B)
                  </option>

                  <option>
                    IF-1102 Kalkulus I (Kelas A)
                  </option>

                </select>

              </div>


              {/* DATE + ROOM */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block font-semibold text-on-surface mb-1">
                    Hari & Tanggal
                  </label>

                  <input
                    type="date"
                    required
                    className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                  />

                </div>


                <div>

                  <label className="block font-semibold text-on-surface mb-1">
                    Ruangan Kuliah
                  </label>

                  <select className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface">

                    <option>
                      Lab Komputer 03
                    </option>

                    <option>
                      Ruang Teori 204
                    </option>

                    <option>
                      Auditorium Gedung D
                    </option>

                  </select>

                </div>

              </div>


              {/* TIME */}

              <div className="grid grid-cols-2 gap-3">

                <div>

                  <label className="block font-semibold text-on-surface mb-1">
                    Jam Mulai
                  </label>

                  <input
                    type="time"
                    defaultValue="13:00"
                    required
                    className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                  />

                </div>


                <div>

                  <label className="block font-semibold text-on-surface mb-1">
                    Jam Selesai
                  </label>

                  <input
                    type="time"
                    defaultValue="15:30"
                    required
                    className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                  />

                </div>

              </div>


              {/* REASON */}

              <div>

                <label className="block font-semibold text-on-surface mb-1">
                  Alasan Penggantian Jadwal
                </label>

                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Menggantikan sesi perkuliahan yang berhalangan..."
                  className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />

              </div>


              {/* BUTTON */}

              <div className="flex items-center justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="px-4 py-2 border border-surface-container-high rounded-xl font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
                >
                  Batal
                </button>


                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow cursor-pointer"
                >
                  Simpan & Notifikasi Mahasiswa
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};