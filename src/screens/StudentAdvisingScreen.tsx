import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';
import { loadAcademicTables, findById, safeNumber } from '../services/academicData';
import type { AdvisingStudentItem } from '../types';

interface StudentAdvisingScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const StudentAdvisingScreen: React.FC<StudentAdvisingScreenProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<AdvisingStudentItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const tables = await loadAcademicTables();
        const mapped = tables.bimbingan.map((b) => {
          const student = findById(tables.mahasiswa, b.mahasiswa_id);
          const prodi = student ? findById(tables.program_studi, student.prodi_id) : null;
          return {
            id: String(b.id), name: String(student?.nama || '-'), nim: String(student?.nim || '-'), prodi: String(prodi?.nama || '-'),
            semester: safeNumber(student?.semester), year: String(student?.angkatan || '-'), gpa: 0, plannedSks: 0, maxSks: 24,
            status: String(b.status || 'pending').toLowerCase().includes('setuj') ? 'approved' : 'pending', isCritical: false, isThesisReady: false,
            avatarUrl: String(student?.avatar_url || ''), lastAdvisingDate: String(b.tanggal || '-'), lastAdvisingNote: String(b.catatan || '-'),
            gpaHistory: [], plannedCourses: [], thesisTitle: undefined, thesisProgress: 0,
          } as AdvisingStudentItem;
        });
        setStudents(mapped);
      } catch (error) { console.error('Gagal mengambil bimbingan:', error); }
    };
    load();
  }, []);
  const [activeTab, setActiveTab] = useState<'all' | 'thesis' | 'critical'>('all');
  const [selectedStudentForSchedule, setSelectedStudentForSchedule] = useState<any | null>(null);
  const [scheduleDate, setScheduleDate] = useState('2025-03-24');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [scheduleRoom, setScheduleRoom] = useState('Ruang Dosen 204');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredList = students.filter((s) => {
    if (activeTab === 'thesis') return s.isThesisReady;
    if (activeTab === 'critical') return s.isCritical;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-base">psychology</span>
            Advising & Thesis Mentorship Portal
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Bimbingan Skripsi & Perwalian Akademik</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pendampingan berkala mahasiswa bimbingan PA, evaluasi kesiapan skripsi, jadwal temu konsultasi, dan pemantauan kelulusan tepat waktu.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('academic-roster')}
            className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Daftar Roster Mahasiswa
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          Semua Mahasiswa Bimbingan ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('thesis')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'thesis'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">school</span>
          Kesiapan Skripsi / Tugas Akhir ({students.filter((s) => s.isThesisReady).length})
        </button>
        <button
          onClick={() => setActiveTab('critical')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'critical'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">warning</span>
          Perlu Intervensi / Pemulihan IPK ({students.filter((s) => s.isCritical).length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Students List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredList.map((st) => (
            <div
              key={st.id}
              className={`p-5 rounded-2xl border transition-all ${
                st.isCritical
                  ? 'bg-rose-50/40 border-rose-200'
                  : st.isThesisReady
                  ? 'bg-indigo-50/40 border-indigo-200'
                  : 'bg-surface-container-lowest border-surface-container-high'
              } shadow-sm space-y-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {st.avatarUrl ? (
                    <img src={st.avatarUrl} alt="" className="w-12 h-12 rounded-xl object-cover border" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center">
                      {st.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-on-surface">{st.name}</h3>
                      {st.isThesisReady && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                          Siap Sidang Skripsi
                        </span>
                      )}
                      {st.isCritical && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 animate-pulse">
                          Perhatian Khusus
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant font-mono">
                      {st.nim} • {st.prodi} • Semester {st.semester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-on-surface-variant">IPK Kumulatif</span>
                    <div className="text-lg font-bold text-on-surface">{st.gpa.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-on-surface-variant">Beban SKS</span>
                    <div className="text-lg font-bold text-primary">{st.plannedSks} / {st.maxSks} SKS</div>
                  </div>
                </div>
              </div>

              {/* Thesis specific details */}
              {st.thesisTitle && (
                <div className="p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">menu_book</span>
                      Judul Tugas Akhir / Skripsi:
                    </span>
                    <span className="text-xs font-bold text-indigo-700">{st.thesisProgress}% Selesai</span>
                  </div>
                  <p className="text-xs text-indigo-950 font-medium italic">"{st.thesisTitle}"</p>
                  <div className="w-full bg-indigo-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${st.thesisProgress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Advising Note */}
              <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between text-on-surface-variant text-[11px]">
                  <span>Catatan Bimbingan Terakhir:</span>
                  <span className="font-semibold">{st.lastAdvisingDate}</span>
                </div>
                <p className="text-on-surface font-medium">{st.lastAdvisingNote}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/60 gap-2">
                <button
                  onClick={() => setSelectedStudentForSchedule(st)}
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Jadwalkan Konsultasi
                </button>

                {st.isThesisReady && (
                  <button
                    onClick={() => triggerToast(`Persetujuan Sidang Skripsi untuk ${st.name} berhasil diterbitkan!`)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Acc Daftar Ujian Sidang
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Rail: Important Academic Advising Deadlines */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">event_note</span>
              Timeline Penting Perwalian & Skripsi
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-low border-l-4 border-primary">
                <div className="font-bold text-on-surface">Batas Pengesahan Rencana Studi (KRS)</div>
                <div className="text-on-surface-variant mt-0.5">25 Maret 2025 • Pukul 23:59 WIB</div>
                <div className="text-[11px] text-primary font-semibold mt-1">Sisa 3 hari lagi</div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border-l-4 border-indigo-600">
                <div className="font-bold text-on-surface">Pendaftaran Sidang Gelombang I</div>
                <div className="text-on-surface-variant mt-0.5">15 April 2025 • BAAK & Panitia Skripsi</div>
                <div className="text-[11px] text-indigo-700 font-semibold mt-1">Syarat: Bebas plagiarisme &lt; 20%</div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border-l-4 border-amber-600">
                <div className="font-bold text-on-surface">Pemberitahuan Mahasiswa Kritis (SP-1)</div>
                <div className="text-on-surface-variant mt-0.5">02 Mei 2025 • Evaluasi Tengah Semester</div>
                <div className="text-[11px] text-amber-700 font-semibold mt-1">Bagi mahasiswa dengan IPK &lt; 2.50</div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-on-surface">Buku Panduan Penulisan Skripsi</h3>
            <p className="text-xs text-on-surface-variant">
              Format baku proposal, template LaTeX & Word, serta aturan sitasi IEEE edisi 2025.
            </p>
            <button
              onClick={() => triggerToast('Pedoman Tugas Akhir 2025 (PDF) berhasil diunduh.')}
              className="w-full py-2 bg-surface-container-high hover:bg-surface-container text-primary font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Unduh Template Skripsi
            </button>
          </div>
        </div>
      </div>

      {/* Consultation Scheduling Modal */}
      {selectedStudentForSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-6 border border-surface-container-high shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedStudentForSchedule(null)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div>
              <h2 className="text-lg font-bold text-on-surface">Atur Jadwal Konsultasi Mahasiswa</h2>
              <p className="text-xs text-on-surface-variant">
                Kirim undangan jadwal perwalian atau bimbingan skripsi untuk {selectedStudentForSchedule.name}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerToast(`Jadwal konsultasi dengan ${selectedStudentForSchedule.name} berhasil dibuat!`);
                setSelectedStudentForSchedule(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-on-surface mb-1">Tanggal Konsultasi</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Waktu / Jam Sesi</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />
              </div>

              <div>
                <label className="block font-semibold text-on-surface mb-1">Lokasi Pertemuan</label>
                <input
                  type="text"
                  value={scheduleRoom}
                  onChange={(e) => setScheduleRoom(e.target.value)}
                  className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForSchedule(null)}
                  className="px-4 py-2 border border-surface-container-high rounded-xl font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold shadow cursor-pointer"
                >
                  Konfirmasi Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
