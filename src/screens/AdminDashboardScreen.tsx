import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';
import { getSessionUser, loadAcademicTables } from '../services/academicData';

interface AdminDashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onNavigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2025/2026 Genap');
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'sync'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({ students: 0, lecturers: 0, classes: 0, approvedKrs: 0, totalKrs: 0 });
  const [adminName, setAdminName] = useState('Administrator');

  useEffect(() => {
    const load = async () => {
      try {
        const tables = await loadAcademicTables();
        const session = getSessionUser();
        setAdminName(session?.username || 'Administrator');
        const approvedKrs = tables.krs.filter((k) => String(k.status || '').toLowerCase().includes('setuj') || String(k.status || '').toLowerCase().includes('approved')).length;
        setStats({ students: tables.mahasiswa.length, lecturers: tables.dosen.length, classes: tables.kelas.length, approvedKrs, totalKrs: tables.krs.length });
      } catch (error) { console.error('Gagal mengambil data admin:', error); }
    };
    load();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const systemHealth = [
    { name: 'Core SIAK Gateway', status: 'Optimal', latency: '42ms', uptime: '99.98%' },
    { name: 'Feeder PDDIKTI Sync Engine', status: 'Synchronized', latency: '128ms', uptime: '99.91%' },
    { name: 'Database Primary Cluster', status: 'Healthy', latency: '12ms', uptime: '100%' },
    { name: 'Identity & SSO Provider (OAuth2)', status: 'Active', latency: '24ms', uptime: '99.99%' },
  ];

  const recentAudits = [
    { id: 'aud-1', user: 'Dr. Aris Thorne', action: 'Submit Nilai Akhir (Grade Finalization)', target: 'TIF-204 Pemrograman Web (38 Mhs)', time: '12 menit lalu', type: 'grade' },
    { id: 'aud-2', user: 'Siti Anindya Zahra (23082010112)', action: 'Pengajuan Perubahan KRS Genap', target: '21 SKS - Menunggu Approval PA', time: '28 menit lalu', type: 'krs' },
    { id: 'aud-3', user: 'BAAK SuperAdmin', action: 'Generate QR Presensi Massal Sesi 11', target: '48 Ruang Kuliah Terjadwal', time: '1 jam lalu', type: 'system' },
    { id: 'aud-4', user: 'Kaprodi Teknik Informatika', action: 'Validasi Kurikulum MBKM 2026', target: '6 Mata Kuliah Rekomendasi Industri', time: '3 jam lalu', type: 'academic' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-bounce">
          <span className="material-symbols-outlined text-emerald-400 text-xl">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              <span className="material-symbols-outlined text-sm">security</span>
              SIAK Enterprise Administrator Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Selamat Bertugas, {adminName}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Monitoring operasional akademik kampus, siklus pelaporan PDDIKTI Kemendikbudristek, validasi KRS mahasiswa, serta kontrol tata kelola kurikulum 2025/2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer"
            >
              <option value="2025/2026 Genap">T.A. 2025/2026 Genap (Aktif)</option>
              <option value="2025/2026 Ganjil">T.A. 2025/2026 Ganjil</option>
              <option value="2024/2025 Genap">T.A. 2024/2025 Genap</option>
            </select>

            <button
              onClick={() => triggerToast('Sinkronisasi data ke PDDikti berhasil dijalankan!')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-base">sync</span>
              Sync PDDIKTI Feeder
            </button>
          </div>
        </div>

        {/* Realtime KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Mahasiswa Terdaftar</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{stats.students}</span>
              <span className="text-xs text-emerald-400 font-medium">98.4% Aktif</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">KRS Ter-Acc Dosen PA</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{stats.totalKrs ? Math.round((stats.approvedKrs / stats.totalKrs) * 100) : 0}%</span>
              <span className="text-xs text-emerald-400 font-medium">+3.1% YoY</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Dosen & Tendik Aktif</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{stats.lecturers}</span>
              <span className="text-xs text-indigo-300 font-medium">84 Bergelar S3/Prof</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Kelas Berjalan Hari Ini</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{stats.classes}</span>
              <span className="text-xs text-emerald-400 font-medium">0 Konflik Ruang</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-container-high pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          Executive Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">history_edu</span>
          Academic Audit Trail ({recentAudits.length})
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'sync'
              ? 'bg-primary text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <span className="material-symbols-outlined text-base">cloud_sync</span>
          PDDIKTI & Server Infrastructure
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-sm">
              <h2 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bolt</span>
                Aksi Cepat Biro Akademik & Administrasi (BAAK)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => onNavigate('academic-roster')}
                  className="p-4 rounded-xl border border-surface-container-high hover:border-primary/50 hover:bg-primary-container/20 transition-all text-left flex flex-col justify-between group"
                >
                  <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">group</span>
                  <div className="mt-3">
                    <div className="font-semibold text-sm text-on-surface">Direktori Mahasiswa</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Filter status KRS & PA</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('course-catalog')}
                  className="p-4 rounded-xl border border-surface-container-high hover:border-primary/50 hover:bg-primary-container/20 transition-all text-left flex flex-col justify-between group"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-2xl group-hover:scale-110 transition-transform">menu_book</span>
                  <div className="mt-3">
                    <div className="font-semibold text-sm text-on-surface">Katalog Kurikulum</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Distribusi SKS & RPS</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('class-schedules')}
                  className="p-4 rounded-xl border border-surface-container-high hover:border-primary/50 hover:bg-primary-container/20 transition-all text-left flex flex-col justify-between group"
                >
                  <span className="material-symbols-outlined text-amber-600 text-2xl group-hover:scale-110 transition-transform">calendar_month</span>
                  <div className="mt-3">
                    <div className="font-semibold text-sm text-on-surface">Jadwal & Ruangan</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Cek bentrok jam kuliah</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigate('gradebook')}
                  className="p-4 rounded-xl border border-surface-container-high hover:border-primary/50 hover:bg-primary-container/20 transition-all text-left flex flex-col justify-between group"
                >
                  <span className="material-symbols-outlined text-indigo-600 text-2xl group-hover:scale-110 transition-transform">fact_check</span>
                  <div className="mt-3">
                    <div className="font-semibold text-sm text-on-surface">Audit Penilaian OBE</div>
                    <div className="text-xs text-on-surface-variant mt-0.5">Rekapitulasi CPMK prodi</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Program Studi Performance Breakdown */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-on-surface">Status Registrasi & KRS per Program Studi</h3>
                  <p className="text-xs text-on-surface-variant">Update terkini berdasarkan sinkronisasi SIAK hari ini</p>
                </div>
                <button
                  onClick={() => triggerToast('Ekspor rekap program studi (XLSX) berhasil dibuat.')}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">download</span> Unduh Laporan
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { prodi: 'S1 Teknik Informatika', students: 840, krsSubmitted: 812, krsApproved: 790, completion: 94 },
                  { prodi: 'S1 Sistem Informasi', students: 620, krsSubmitted: 605, krsApproved: 588, completion: 95 },
                  { prodi: 'S1 Sains Data', students: 310, krsSubmitted: 298, krsApproved: 285, completion: 92 },
                  { prodi: 'D3 Teknik Komputer', students: 240, krsSubmitted: 232, krsApproved: 220, completion: 91 },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-on-surface">{item.prodi}</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {item.completion}% Selesai
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${item.completion}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>Total: {item.students} Mahasiswa</span>
                      <span>KRS Diajukan: {item.krsSubmitted} ({item.krsApproved} Disetujui Dosen PA)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column: System Health & Urgent Approvals */}
          <div className="space-y-6">
            {/* System Health Monitor */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">dns</span>
                Status Infrastruktur SIAK
              </h3>
              <div className="space-y-3">
                {systemHealth.map((sh, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-on-surface">{sh.name}</div>
                      <div className="text-on-surface-variant text-[11px]">Uptime: {sh.uptime} • Ping: {sh.latency}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                      {sh.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container-high flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">Backup Terakhir: Hari ini 03:00 WIB</span>
                <button
                  onClick={() => triggerToast('Proses snapshot database berhasil dimulai.')}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Snapshot Sekarang
                </button>
              </div>
            </div>

            {/* Pending Administrative Actions */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-sm">
              <h3 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">notifications_active</span>
                Tugas Menunggu Verifikasi
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-amber-900">Perpanjangan Dispensasi KRS</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-200 px-1.5 py-0.5 rounded">12 Mhs</span>
                  </div>
                  <p className="text-xs text-amber-800">12 mahasiswa mengajukan perpanjangan batas pengisian KRS karena kendala administrasi pembayaran.</p>
                  <button
                    onClick={() => triggerToast('Dispensasi KRS telah disetujui untuk 12 mahasiswa.')}
                    className="self-end px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition cursor-pointer"
                  >
                    Beri Izin Dispensasi
                  </button>
                </div>

                <div className="p-3 rounded-xl border border-surface-container-high bg-surface-container-low flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-xs text-on-surface">Validasi NIDN Dosen Baru</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">3 Dosen</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">3 Dosen Tetap Baru memerlukan aktivasi akun SIAK dan penugasan kelas semester ini.</p>
                  <button
                    onClick={() => triggerToast('Akun Dosen baru telah diaktifkan ke dalam sistem SIAK.')}
                    className="self-end px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-hover transition cursor-pointer"
                  >
                    Aktivasi Akun Dosen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-on-surface">Jejak Audit Aktivitas Akademik Realtime</h3>
            <span className="text-xs text-on-surface-variant">Merekam setiap perubahan nilai, KRS, dan presensi dosen/mahasiswa</span>
          </div>

          <div className="divide-y divide-surface-container-high">
            {recentAudits.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary font-semibold">
                    <span className="material-symbols-outlined text-lg">
                      {item.type === 'grade' ? 'grade' : item.type === 'krs' ? 'assignment' : item.type === 'system' ? 'settings' : 'school'}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-on-surface">{item.action}</div>
                    <div className="text-xs text-on-surface-variant flex items-center gap-2">
                      <span className="font-semibold text-primary">{item.user}</span>
                      <span>•</span>
                      <span>{item.target}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-on-surface-variant">{item.time}</span>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Tervalidasi SHA-256</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-surface-container-high shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-on-surface">Konfigurasi Sinkronisasi PDDIKTI Feeder</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Sinkronisasi data aktivitas perkuliahan mahasiswa, kelulusan, dan beban kerja dosen (BKD) ke pangkalan data nasional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-surface-container-high bg-surface-container-low space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-on-surface">Status Endpoint Feeder</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold text-emerald-700 bg-emerald-100">ONLINE</span>
              </div>
              <p className="text-xs text-on-surface-variant">URL Feeder: https://feeder.kampus.ac.id:8082/ws/live2.php</p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => triggerToast('Tes koneksi Feeder PDDIKTI: SUKSES (200 OK)')}
                  className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Test Connection
                </button>
                <button
                  onClick={() => triggerToast('Token WS Feeder berhasil diperbarui.')}
                  className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Refresh Token
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-surface-container-high bg-surface-container-low space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-on-surface">Antrean Sinkronisasi (Queue)</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold text-indigo-700 bg-indigo-100">0 PENDING</span>
              </div>
              <p className="text-xs text-on-surface-variant">Data mahasiswa, KRS, dan nilai semester ini telah 100% tersinkron tanpa error.</p>
              <div className="pt-2">
                <button
                  onClick={() => triggerToast('Ekspor berkas CSV PDDIKTI selesai diunduh.')}
                  className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Unduh Log Sinkronisasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
