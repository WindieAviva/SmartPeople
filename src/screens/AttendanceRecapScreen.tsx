import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';
import { getSessionUser, loadAcademicTables, findById } from '../services/academicData';
import type { AttendanceRecord } from '../types';

interface AttendanceRecapScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AttendanceRecapScreen: React.FC<AttendanceRecapScreenProps> = ({ onNavigate }) => {
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(25);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const tables = await loadAcademicTables();
        const session = getSessionUser();
        const studentId = session?.reference_id;
        const logs = tables.absensi
          .filter((a) => !studentId || String(a.mahasiswa_id).trim() === String(studentId).trim())
          .map((a) => {
            const kelas = findById(tables.kelas, a.kelas_id);
            const mk = kelas ? findById(tables.mata_kuliah, kelas.mata_kuliah_id) : null;
            const dosen = kelas ? findById(tables.dosen, kelas.dosen_id) : null;
            return {
              id: String(a.id), courseCode: String(mk?.kode || '-'), courseName: String(mk?.nama || '-'),
              sessionNumber: Number(a.pertemuan) || 0, status: String(a.status || 'ALPA').toUpperCase() as AttendanceRecord['status'],
              statusLabel: String(a.status || 'ALPA'), topic: String(a.keterangan || '-'), date: String(a.tanggal || '-'), time: '',
              lecturer: String(dosen?.nama || '-'), location: String(a.ruangan || '-'), isGeotagged: false,
              notes: String(a.keterangan || ''),
            };
          });
        setAttendanceLogs(logs);
      } catch (error) { console.error('Gagal mengambil presensi:', error); }
    };
    load();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredLogs = attendanceLogs.filter((log) => {
    const matchesCourse = selectedCourse === 'ALL' || log.courseCode === selectedCourse;
    const matchesStatus = selectedStatus === 'ALL' || log.status === selectedStatus;
    const matchesSearch =
      log.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.lecturer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
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
            <span className="material-symbols-outlined text-base">co_present</span>
            Presensi & Rekapitulasi Kehadiran Mahasiswa
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Rekap Presensi Digital & Geo-Tagging</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pantau tingkat kehadiran, verifikasi surat izin/sakit, dan buka sesi QR Code absensi dinamis di ruang kuliah.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            Buka QR Presensi Dosen
          </button>
          <button
            onClick={() => setShowExcuseModal(true)}
            className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            Ajukan Izin / Sakit
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Total Pertemuan</span>
            <span className="material-symbols-outlined text-primary">event_available</span>
          </div>
          <div className="text-3xl font-bold text-on-surface">14</div>
          <div className="text-xs text-on-surface-variant mt-1">Target Semester Genap 2025/2026</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Tingkat Kehadiran</span>
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          </div>
          <div className="text-3xl font-bold text-emerald-700">92.8%</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Memenuhi Syarat UAS (Min. 75%)</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Izin & Sakit Resmi</span>
            <span className="material-symbols-outlined text-amber-600">assignment_turned_in</span>
          </div>
          <div className="text-3xl font-bold text-amber-700">2 Sesi</div>
          <div className="text-xs text-on-surface-variant mt-1">Disetujui BAAK & Dosen Pengampu</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Tanpa Keterangan (Alfa)</span>
            <span className="material-symbols-outlined text-slate-400">warning</span>
          </div>
          <div className="text-3xl font-bold text-on-surface">0</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Rekor Bersih (Tanpa Alfa)</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Course select */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3.5 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Semua Mata Kuliah</option>
            {[...new Map(attendanceLogs.map((log) => [log.courseCode, log])).values()].map((log) => (
              <option key={log.courseCode} value={log.courseCode}>{log.courseCode} {log.courseName}</option>
            ))}
          </select>

          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Semua Status Kehadiran</option>
            <option value="HADIR">Hadir Saja</option>
            <option value="IZIN">Izin Resmi Saja</option>
            <option value="SAKIT">Sakit Saja</option>
            <option value="ALFA">Alfa Saja</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
          <input
            type="text"
            placeholder="Cari materi kuliah atau dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Attendance Records List */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm overflow-hidden">
        <div className="p-5 border-b border-surface-container-high flex items-center justify-between">
          <div className="font-bold text-sm text-on-surface">Riwayat Presensi Per Pertemuan ({filteredLogs.length} Catatan)</div>
          <button
            onClick={() => triggerToast('Berkas rekap presensi (PDF/XLSX) berhasil diunduh.')}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span> Ekspor Rekap Presensi
          </button>
        </div>

        <div className="divide-y divide-surface-container-high">
          {filteredLogs.map((log) => {
            const isHadir = log.status === 'HADIR';
            const isIzin = log.status === 'IZIN';
            const isSakit = log.status === 'SAKIT';

            return (
              <div key={log.id} className="p-5 hover:bg-surface-container-low/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold ${
                      isHadir
                        ? 'bg-emerald-100 text-emerald-800'
                        : isIzin
                        ? 'bg-amber-100 text-amber-800'
                        : isSakit
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold">Sesi</span>
                    <span className="text-base leading-none">{log.sessionNumber}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-on-surface">{log.courseName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          isHadir
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isIzin
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : isSakit
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {log.statusLabel}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant font-medium">{log.topic}</p>

                    <div className="flex items-center gap-4 text-xs text-on-surface-variant/80 flex-wrap pt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {log.date} ({log.time})
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {log.lecturer}
                      </span>
                      {log.location && (
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <span className="material-symbols-outlined text-sm">near_me</span>
                          {log.location}
                        </span>
                      )}
                    </div>

                    {log.attachmentName && (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high rounded-lg text-xs font-semibold text-primary hover:bg-primary-container/30 cursor-pointer transition">
                          <span className="material-symbols-outlined text-sm">attachment</span>
                          {log.attachmentName}
                        </span>
                        {log.approvalStatus && (
                          <span className="text-xs text-emerald-700 font-semibold">{log.approvalStatus}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                  <div className="text-xs font-semibold text-on-surface">
                    {log.checkInTime || (log.status === 'IZIN' ? 'Dispensasi BAAK' : 'Dokumen Medis')}
                  </div>
                  <button
                    onClick={() => triggerToast(`Detail sesi ${log.sessionNumber} dibuka.`)}
                    className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Detail Presensi <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Modal for Lecturer */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-6 border border-surface-container-high shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Sesi Kuliah Aktif
              </span>
              <h2 className="text-xl font-bold text-on-surface">QR Presensi Kuliah Dinamis</h2>
              <p className="text-xs text-on-surface-variant">TIF-204 Pemrograman Web • Ruang Lab Komputer 3</p>
            </div>

            {/* QR Mock Illustration */}
            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center space-y-3">
              <div className="w-52 h-52 bg-neutral-900 rounded-xl p-3 flex flex-col items-center justify-center text-white relative shadow-inner">
                {/* Simulated QR Pattern */}
                <div className="w-full h-full border-4 border-white flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 border-4 border-white bg-black"></div>
                    <div className="w-10 h-10 border-4 border-white bg-black"></div>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-emerald-400 animate-spin">sync</span>
                    <div className="text-[10px] font-mono tracking-widest uppercase">SMART-AUTH-TOKEN</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="w-10 h-10 border-4 border-white bg-black"></div>
                    <div className="w-6 h-6 bg-white"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-sm">timer</span>
                Refresh otomatis dalam: <span className="font-mono text-sm font-bold">{qrCountdown}s</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-on-surface-variant">
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl">
                <span>Radius Geofencing GPS:</span>
                <span className="font-bold text-emerald-700">Aktif (&lt; 25 meter dari lab)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-surface-container-low rounded-xl">
                <span>Mahasiswa Telah Presensi:</span>
                <span className="font-bold text-primary">34 / 38 Orang (89%)</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowQrModal(false);
                triggerToast('Sesi presensi ditutup dan hasil disimpan ke database SIAK.');
              }}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition cursor-pointer shadow"
            >
              Tutup & Kunci Sesi Presensi
            </button>
          </div>
        </div>
      )}

      {/* Excuse Submission Modal */}
      {showExcuseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-6 border border-surface-container-high shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowExcuseModal(false)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div>
              <h2 className="text-xl font-bold text-on-surface">Form Pengajuan Izin / Sakit Resmi</h2>
              <p className="text-xs text-on-surface-variant">Dokumen akan diverifikasi oleh Dosen Pengampu & Biro Akademik</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowExcuseModal(false);
                triggerToast('Pengajuan izin berhasil disubmit. Menunggu verifikasi dosen.');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Mata Kuliah</label>
                <select className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface">
                  <option>TIF-204 Pemrograman Web (Sesi 11)</option>
                  <option>TIF-210 Jaringan Komputer (Sesi 11)</option>
                  <option>TIF-206 Basis Data Lanjut (Sesi 11)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Jenis Keterangan</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="p-3 border border-surface-container-high rounded-xl flex items-center gap-2 cursor-pointer hover:bg-surface-container-low">
                    <input type="radio" name="alasan" defaultChecked className="text-primary" />
                    <span className="text-xs font-semibold text-on-surface">Sakit (Ada SKD Dokter)</span>
                  </label>
                  <label className="p-3 border border-surface-container-high rounded-xl flex items-center gap-2 cursor-pointer hover:bg-surface-container-low">
                    <input type="radio" name="alasan" className="text-primary" />
                    <span className="text-xs font-semibold text-on-surface">Izin Tugas Kampus / Lomba</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Alasan Singkat & Detail</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Mengikuti delegasi lomba Gemastik 2025 di Bandung mewakili universitas..."
                  className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Unggah Surat Bukti (PDF / JPG / PNG)</label>
                <div className="border-2 border-dashed border-surface-container-high hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer bg-surface-container-low">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">upload_file</span>
                  <div className="text-xs font-semibold text-on-surface mt-1">Pilih Berkas atau Tarik ke Sini</div>
                  <div className="text-[11px] text-on-surface-variant">Maksimal ukuran berkas 5 MB</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExcuseModal(false)}
                  className="px-4 py-2 border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow transition cursor-pointer"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
