import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';
import { loadAcademicTables, findById } from '../services/academicData';

interface AcademicRosterScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AcademicRosterScreen: React.FC<AcademicRosterScreenProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAngkatan, setSelectedAngkatan] = useState('ALL');
  const [selectedKrsStatus, setSelectedKrsStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedStudentForAdvising, setSelectedStudentForAdvising] = useState<any | null>(null);
  const [advisingNoteInput, setAdvisingNoteInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAcademicTables()
      .then((tables) => {
        const convertedStudents = tables.mahasiswa.map((student: any) => {
          const nilai = tables.nilai.filter((n) => String(n.mahasiswa_id).trim() === String(student.id).trim());
          const krs = tables.krs.filter((k) => String(k.mahasiswa_id).trim() === String(student.id).trim());
          const attendance = tables.absensi.filter((a) => String(a.mahasiswa_id).trim() === String(student.id).trim());
          const approved = krs.filter((k) => String(k.status || '').toLowerCase().includes('setuj') || String(k.status || '').toLowerCase().includes('approved'));
          const gpa = nilai.length ? Number((nilai.reduce((sum, n) => sum + Number(n.nilai_akhir || 0), 0) / nilai.length / 25).toFixed(2)) : 0;
          const passedSks = krs.reduce((sum, k) => {
            const kelas = findById(tables.kelas, k.kelas_id);
            const mk = kelas ? findById(tables.mata_kuliah, kelas.mata_kuliah_id) : null;
            return sum + (String(k.status || '').toLowerCase().includes('setuj') ? Number(mk?.sks || 0) : 0);
          }, 0);
          const attendanceRate = attendance.length ? Number((attendance.filter((a) => String(a.status || '').toUpperCase() === 'HADIR').length / attendance.length * 100).toFixed(1)) : 0;
          const prodi = findById(tables.program_studi, student.prodi_id);
          return {
            id: student.id, name: student.nama, nim: String(student.nim), email: student.email, angkatan: String(student.angkatan), avatarUrl: student.avatar_url || '',
            gpa, passedSks, attendanceRate, krsStatus: approved.length === krs.length && krs.length ? 'approved' : krs.length ? 'pending' : 'unregistered',
            prodi: prodi?.nama || student.prodi_id || '-', classSection: '-', advisor: '-', advisorGroup: '-', krsSks: passedSks,
          };
        });
        setStudents(convertedStudents);
      })
      .catch((error) => console.error('Gagal mengambil data mahasiswa:', error))
      .finally(() => setIsLoading(false));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAngkatan = selectedAngkatan === 'ALL' || s.angkatan === selectedAngkatan;
    const matchesKrs = selectedKrsStatus === 'ALL' || s.krsStatus === selectedKrsStatus;
    return matchesSearch && matchesAngkatan && matchesKrs;
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
            <span className="material-symbols-outlined text-base">supervisor_account</span>
            Perwalian & Roster Mahasiswa Bimbingan
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Direktori Akademik & Mahasiswa Bimbingan</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Kelola persetujuan KRS, pantau perkembangan IPK, tren kelulusan SKS, serta bimbingan akademik intensif.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('student-advising')}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base">assignment_turned_in</span>
            Bimbingan Skripsi & Perwalian
          </button>
          <button
            onClick={() => triggerToast('Daftar mahasiswa bimbingan berhasil diekspor (XLSX).')}
            className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            Ekspor Roster
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Total Mahasiswa PA</span>
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <div className="text-3xl font-bold text-on-surface">{students.length} Mhs</div>
          <div className="text-xs text-on-surface-variant mt-1">Kelompok PA-04 & Mandiri</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Rata-rata IPK</span>
            <span className="material-symbols-outlined text-emerald-600">trending_up</span>
          </div>
          <div className="text-3xl font-bold text-emerald-700">3.64</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Predikat Pujian (Cum Laude)</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">KRS Menunggu Approval</span>
            <span className="material-symbols-outlined text-amber-600">pending_actions</span>
          </div>
          <div className="text-3xl font-bold text-amber-700">1 Mhs</div>
          <div className="text-xs text-amber-600 font-semibold mt-1">Batas waktu s/d 25 Maret</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Siap Skripsi / TA</span>
            <span className="material-symbols-outlined text-indigo-600">school</span>
          </div>
          <div className="text-3xl font-bold text-indigo-700">1 Mhs</div>
          <div className="text-xs text-on-surface-variant mt-1">SKS Lulus &gt; 130 SKS</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Angkatan */}
          <select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="px-3.5 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Semua Angkatan</option>
            <option value="2021">Angkatan 2021</option>
            <option value="2022">Angkatan 2022</option>
            <option value="2023">Angkatan 2023</option>
            <option value="2024">Angkatan 2024</option>
          </select>

          {/* Status KRS */}
          <select
            value={selectedKrsStatus}
            onChange={(e) => setSelectedKrsStatus(e.target.value)}
            className="px-3.5 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Semua Status KRS</option>
            <option value="approved">Disetujui (Approved)</option>
            <option value="pending">Menunggu Persetujuan</option>
            <option value="unregistered">Belum Mengisi KRS</option>
            <option value="leave">Cuti Kuliah</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center bg-surface-container-low border border-surface-container-high rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-primary text-white shadow' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-base">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-primary text-white shadow' : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-base">view_list</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
          <input
            type="text"
            placeholder="Cari nama, NIM, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Content: Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((st) => {
            const isApproved = st.krsStatus === 'approved';
            const isPending = st.krsStatus === 'pending';
            const isUnregistered = st.krsStatus === 'unregistered';
            const isLeave = st.krsStatus === 'leave';

            return (
              <div
                key={st.id}
                className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm p-5 flex flex-col justify-between hover:border-primary/50 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {st.avatarUrl ? (
                        <img
                          src={st.avatarUrl}
                          alt={st.name}
                          className="w-12 h-12 rounded-xl object-cover border border-surface-container-high shadow-xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                          {st.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                          {st.name}
                        </h3>
                        <p className="text-xs font-mono text-on-surface-variant">{st.nim}</p>
                        <p className="text-[11px] text-on-surface-variant">{st.prodi} • {st.angkatan}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : isUnregistered
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isApproved
                        ? 'KRS Disetujui'
                        : isPending
                        ? 'Review KRS'
                        : isUnregistered
                        ? 'Belum KRS'
                        : 'Cuti Studi'}
                    </span>
                  </div>

                  {/* Student Stats Mini Grid */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-surface-container-low rounded-xl mb-4 text-center">
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-semibold">IPK Terkini</div>
                      <div className="text-sm font-bold text-emerald-700">{st.gpa.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-semibold">SKS Lulus</div>
                      <div className="text-sm font-bold text-on-surface">{st.passedSks} SKS</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-semibold">Presensi</div>
                      <div className="text-sm font-bold text-indigo-700">{st.attendanceRate}%</div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudentForAdvising(st);
                      setAdvisingNoteInput('');
                    }}
                    className="flex-1 py-1.5 px-3 bg-surface-container-high hover:bg-surface-container text-on-surface text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">chat_bubble</span>
                    Bimbingan PA
                  </button>

                  {isPending ? (
                    <button
                      onClick={() => triggerToast(`KRS Mahasiswa ${st.name} (21 SKS) telah disetujui!`)}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Acc KRS
                    </button>
                  ) : (
                    <button
                      onClick={() => triggerToast(`Membuka riwayat studi & transkrip ${st.name}`)}
                      className="py-1.5 px-3 text-primary hover:bg-primary-container/20 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      Transkrip
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold border-b border-surface-container-high">
              <tr>
                <th className="p-4">Mahasiswa</th>
                <th className="p-4">Program Studi</th>
                <th className="p-4">Angkatan</th>
                <th className="p-4">IPK</th>
                <th className="p-4">SKS Lulus</th>
                <th className="p-4">Status KRS</th>
                <th className="p-4">Kehadiran</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-surface-container-low/50 transition">
                  <td className="p-4 flex items-center gap-3">
                    {st.avatarUrl ? (
                      <img src={st.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center">
                        {st.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-on-surface">{st.name}</div>
                      <div className="font-mono text-on-surface-variant text-[11px]">{st.nim}</div>
                    </div>
                  </td>
                  <td className="p-4">{st.prodi}</td>
                  <td className="p-4">{st.angkatan}</td>
                  <td className="p-4 font-bold text-emerald-700">{st.gpa.toFixed(2)}</td>
                  <td className="p-4 font-semibold">{st.passedSks} SKS</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        st.krsStatus === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.krsStatus === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {st.krsStatus}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{st.attendanceRate}%</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedStudentForAdvising(st);
                        setAdvisingNoteInput('');
                      }}
                      className="px-3 py-1 bg-surface-container-high hover:bg-surface-container text-primary font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      Bimbingan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Advising Note Modal */}
      {selectedStudentForAdvising && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-6 border border-surface-container-high shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedStudentForAdvising(null)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3">
              {selectedStudentForAdvising.avatarUrl ? (
                <img
                  src={selectedStudentForAdvising.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center">
                  {selectedStudentForAdvising.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-base text-on-surface">{selectedStudentForAdvising.name}</h3>
                <p className="text-xs text-on-surface-variant">
                  {selectedStudentForAdvising.nim} • {selectedStudentForAdvising.prodi}
                </p>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">IPK / SKS Akumulasi:</span>
                <span className="font-bold text-on-surface">
                  {selectedStudentForAdvising.gpa} / {selectedStudentForAdvising.passedSks} SKS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status KRS Genap:</span>
                <span className="font-bold text-emerald-700 capitalize">{selectedStudentForAdvising.krsStatus}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Catatan Bimbingan PA / Rekomendasi Studi
              </label>
              <textarea
                rows={4}
                value={advisingNoteInput}
                onChange={(e) => setAdvisingNoteInput(e.target.value)}
                placeholder="Tuliskan arahan akademik, persetujuan mata kuliah pilihan, atau catatan evaluasi studi..."
                className="w-full p-3 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentForAdvising(null)}
                className="px-4 py-2 border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Catatan bimbingan untuk ${selectedStudentForAdvising.name} tersimpan.`);
                  setSelectedStudentForAdvising(null);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow cursor-pointer"
              >
                Simpan ke Buku PA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
