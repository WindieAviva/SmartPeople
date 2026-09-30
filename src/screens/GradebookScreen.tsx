import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';
import { calculateFinalGrade, gradeLetter, loadAcademicTables, findById, statusToGrade } from '../services/academicData';
import type { GradeItem } from '../types';

interface GradebookScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const GradebookScreen: React.FC<GradebookScreenProps> = ({ onNavigate }) => {
  const [studentsGrades, setStudentsGrades] = useState<GradeItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const tables = await loadAcademicTables();
        const mapped = tables.nilai.map((n) => {
          const student = findById(tables.mahasiswa, n.mahasiswa_id);
          const finalScore = calculateFinalGrade(n);
          return {
            id: String(n.id), studentName: String(student?.nama || n.mahasiswa_id || '-'), nim: String(student?.nim || '-'), avatarUrl: String(student?.avatar_url || ''),
            tugas: Number(n.tugas) || 0, kuis: Number(n.kuis) || 0, uts: Number(n.uts) || 0, uas: Number(n.uas) || 0, presensi: Number(n.presensi) || 0,
            nilaiAkhir: finalScore, gradeLetter: String(n.grade || gradeLetter(finalScore)) as GradeItem['gradeLetter'],
            status: statusToGrade(n.status || (finalScore >= 55 ? 'Lulus' : 'Gagal')) as GradeItem['status'],
          };
        });
        setStudentsGrades(mapped);
      } catch (error) { console.error('Gagal mengambil nilai:', error); }
    };
    load();
  }, []);
  const [selectedCourse, setSelectedCourse] = useState('TIF-204');
  const [activeTab, setActiveTab] = useState<'grades' | 'obe'>('grades');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleScoreChange = (id: string, field: 'tugas' | 'kuis' | 'uts' | 'uas', val: number) => {
    const clampedVal = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setStudentsGrades((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: clampedVal };
          // Calculate new final score: Tugas 30%, Kuis 20%, UTS 25%, UAS 25%
          const finalScore = Number(
            (updated.tugas * 0.3 + updated.kuis * 0.2 + updated.uts * 0.25 + updated.uas * 0.25).toFixed(1)
          );
          let grade: 'A' | 'A-' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'E' = 'E';
          let status: 'Lulus' | 'Remedial' | 'Gagal' = 'Gagal';
          if (finalScore >= 85) {
            grade = 'A';
            status = 'Lulus';
          } else if (finalScore >= 80) {
            grade = 'A-';
            status = 'Lulus';
          } else if (finalScore >= 75) {
            grade = 'B+';
            status = 'Lulus';
          } else if (finalScore >= 70) {
            grade = 'B';
            status = 'Lulus';
          } else if (finalScore >= 65) {
            grade = 'C+';
            status = 'Lulus';
          } else if (finalScore >= 55) {
            grade = 'C';
            status = 'Lulus';
          } else if (finalScore >= 45) {
            grade = 'D';
            status = 'Remedial';
          } else {
            grade = 'E';
            status = 'Gagal';
          }
          return {
            ...updated,
            nilaiAkhir: finalScore,
            gradeLetter: grade,
            status,
          };
        }
        return item;
      })
    );
  };

  const filteredGrades = studentsGrades.filter(
    (s) =>
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <span className="material-symbols-outlined text-base">fact_check</span>
            Buku Nilai & Kurikulum OBE (Outcome-Based Education)
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Gradebook & Evaluasi Capaian Pembelajaran</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pengelolaan nilai komprehensif, kalkulasi otomatis nilai akhir (NA), dan pemetaan CPMK/CPL sesuai standar akreditasi internasional (ABET/ASIIN).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => triggerToast('Nilai sementara berhasil disimpan ke server.')}
            className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">save</span>
            Simpan Draf
          </button>
          <button
            onClick={() => triggerToast('Nilai akhir berhasil dikunci dan difinalisasi ke BAAK / SIAK!')}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base">lock</span>
            Finalisasi & Kunci Nilai
          </button>
        </div>
      </div>

      {/* OBE Weighting Formula Card */}
      <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-high shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase text-primary tracking-wider">Formula Pembobotan Resmi</span>
            <h3 className="font-bold text-base text-on-surface">TIF-204 Pemrograman Web (Kelas A • 38 Mahasiswa)</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Status: Masa Input Nilai Aktif (s/d 30 Maret)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high">
            <span className="text-on-surface-variant uppercase font-semibold text-[10px]">Tugas / Mini-Project</span>
            <div className="text-xl font-bold text-primary mt-0.5">30%</div>
            <span className="text-[11px] text-on-surface-variant">CPMK 1 & 2</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high">
            <span className="text-on-surface-variant uppercase font-semibold text-[10px]">Kuis & Praktikum</span>
            <div className="text-xl font-bold text-primary mt-0.5">20%</div>
            <span className="text-[11px] text-on-surface-variant">CPMK 1</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high">
            <span className="text-on-surface-variant uppercase font-semibold text-[10px]">Ujian Tengah Sem. (UTS)</span>
            <div className="text-xl font-bold text-primary mt-0.5">25%</div>
            <span className="text-[11px] text-on-surface-variant">CPMK 2</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-surface-container-high">
            <span className="text-on-surface-variant uppercase font-semibold text-[10px]">Ujian Akhir Sem. (UAS)</span>
            <div className="text-xl font-bold text-primary mt-0.5">25%</div>
            <span className="text-[11px] text-on-surface-variant">CPMK 3</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'grades'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-base">table_chart</span>
            Matriks Nilai Mahasiswa ({filteredGrades.length})
          </button>
          <button
            onClick={() => setActiveTab('obe')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'obe'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            Ketercapaian CPMK / CPL
          </button>
        </div>

        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
          <input
            type="text"
            placeholder="Cari mahasiswa atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {activeTab === 'grades' ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold border-b border-surface-container-high">
              <tr>
                <th className="p-4">Mahasiswa</th>
                <th className="p-4 text-center w-24">Tugas (30%)</th>
                <th className="p-4 text-center w-24">Kuis (20%)</th>
                <th className="p-4 text-center w-24">UTS (25%)</th>
                <th className="p-4 text-center w-24">UAS (25%)</th>
                <th className="p-4 text-center">Presensi</th>
                <th className="p-4 text-center">Nilai Akhir</th>
                <th className="p-4 text-center">Huruf</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              {filteredGrades.map((st) => (
                <tr key={st.id} className="hover:bg-surface-container-low/40 transition">
                  <td className="p-4 flex items-center gap-3">
                    {st.avatarUrl ? (
                      <img src={st.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center">
                        {st.studentName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-on-surface">{st.studentName}</div>
                      <div className="font-mono text-on-surface-variant text-[11px]">{st.nim}</div>
                    </div>
                  </td>

                  {/* Editable input columns */}
                  <td className="p-4 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={st.tugas}
                      onChange={(e) => handleScoreChange(st.id, 'tugas', Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-center font-bold text-on-surface focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </td>

                  <td className="p-4 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={st.kuis}
                      onChange={(e) => handleScoreChange(st.id, 'kuis', Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-center font-bold text-on-surface focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </td>

                  <td className="p-4 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={st.uts}
                      onChange={(e) => handleScoreChange(st.id, 'uts', Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-center font-bold text-on-surface focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </td>

                  <td className="p-4 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={st.uas}
                      onChange={(e) => handleScoreChange(st.id, 'uas', Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-center font-bold text-on-surface focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </td>

                  <td className="p-4 text-center font-semibold text-emerald-700">
                    {st.presensi}%
                  </td>

                  <td className="p-4 text-center font-bold text-base text-primary">
                    {st.nilaiAkhir.toFixed(1)}
                  </td>

                  <td className="p-4 text-center">
                    <span className="inline-block w-8 py-0.5 rounded font-bold text-center bg-primary-container text-on-primary-container">
                      {st.gradeLetter}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        st.status === 'Lulus'
                          ? 'bg-emerald-100 text-emerald-800'
                          : st.status === 'Remedial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {st.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* OBE Analysis View */
        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-on-surface">Pemetaan Capaian Pembelajaran Lulusan (CPL / CPMK)</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Evaluasi ketercapaian target kompetensi mahasiswa kelas TIF-204 berdasarkan rubrik penilaian terstandar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary uppercase">CPMK-1: Frontend & UI/UX</span>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">91.4% Tercapai</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Kemampuan merancang antarmuka web interaktif menggunakan Tailwind CSS & React Components sesuai standar modern.
              </p>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '91.4%' }}></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary uppercase">CPMK-2: RESTful API & Node.js</span>
                <span className="font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">86.2% Tercapai</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Kemampuan mengimplementasikan backend service modular, skema database relasional, dan validasi data request.
              </p>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '86.2%' }}></div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary uppercase">CPMK-3: Security & Deployment</span>
                <span className="font-bold text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">78.5% Tercapai</span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Kemampuan mengamankan endpoint API dengan JWT Auth, CORS, serta proses build deployment ke container platform.
              </p>
              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '78.5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
