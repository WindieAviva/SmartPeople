import React, { useEffect, useState } from 'react';
import { ScreenId } from '../types';
import { getSessionUser, loadAcademicTables, findById } from '../services/academicData';

interface CourseCatalogScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

interface CatalogCourse {
  code: string;
  name: string;
  sks: number;
  semester: number;
  type: 'Wajib Prodi' | 'Wajib Universitas' | 'Peminatan';
  prerequisite: string;
  lecturer: string;
  enrolled: boolean;
  description: string;
  rpsUrl: string;
}

const ALL_CATALOG_COURSES: CatalogCourse[] = [
  {
    code: 'IF-1101',
    name: 'Dasar Pemrograman Komputer',
    sks: 3,
    semester: 1,
    type: 'Wajib Prodi',
    prerequisite: '-',
    lecturer: 'Nurul Hidayati, M.Cs.',
    enrolled: true,
    description: 'Konsep dasar algoritma, kontrol alur, fungsi, struktur data dasar menggunakan Python.',
    rpsUrl: 'RPS_IF1101_DasarPemrograman.pdf',
  },
  {
    code: 'IF-1102',
    name: 'Kalkulus I',
    sks: 3,
    semester: 1,
    type: 'Wajib Prodi',
    prerequisite: '-',
    lecturer: 'Dr. Ahmad Dahlan, M.Pd.',
    enrolled: true,
    description: 'Fungsi, limit, diferensial, turunan berantai, dan pengantar kalkulus integral analitik.',
    rpsUrl: 'RPS_IF1102_Kalkulus1.pdf',
  },
  {
    code: 'IF-2105',
    name: 'Basis Data Relasional',
    sks: 3,
    semester: 3,
    type: 'Wajib Prodi',
    prerequisite: 'Dasar Pemrograman',
    lecturer: 'Dr. Sri Mulyani, M.T.',
    enrolled: true,
    description: 'Model relasional, perancangan ERD, aljabar relasional, normalisasi 1NF-3NF, dan sintaks SQL kompleks.',
    rpsUrl: 'RPS_IF2105_BasisData.pdf',
  },
  {
    code: 'IF-2204',
    name: 'Struktur Data & Algoritma',
    sks: 4,
    semester: 3,
    type: 'Wajib Prodi',
    prerequisite: 'Dasar Pemrograman',
    lecturer: 'Maya Puspita, Ph.D.',
    enrolled: true,
    description: 'Array, Linked List, Stack, Queue, Hash Tables, Binary Search Tree, AVL, dan Graph Traversals.',
    rpsUrl: 'RPS_IF2204_StrukturData.pdf',
  },
  {
    code: 'TIF-204',
    name: 'Pemrograman Web Komprehensif',
    sks: 3,
    semester: 4,
    type: 'Wajib Prodi',
    prerequisite: 'Basis Data & Pemrograman',
    lecturer: 'Dr. Aris Thorne, M.Kom.',
    enrolled: true,
    description: 'Full-stack web architecture, React, Node.js, Express, RESTful APIs, JWT Auth, and responsive UI design.',
    rpsUrl: 'RPS_TIF204_PemrogramanWeb.pdf',
  },
  {
    code: 'TIF-210',
    name: 'Jaringan Komputer & Cyber Security',
    sks: 3,
    semester: 4,
    type: 'Wajib Prodi',
    prerequisite: 'Arsitektur Komputer',
    lecturer: 'Hendra Gunawan, S.Kom., M.T.',
    enrolled: true,
    description: 'OSI 7 Layers, TCP/IP, routing protocols OSPF/BGP, subnetting CIDR, packet sniffing, firewall rules.',
    rpsUrl: 'RPS_TIF210_Jarkom.pdf',
  },
  {
    code: 'TIF-310',
    name: 'Kecerdasan Buatan & Machine Learning',
    sks: 3,
    semester: 5,
    type: 'Wajib Prodi',
    prerequisite: 'Struktur Data & Kalkulus',
    lecturer: 'Prof. Maya Lestari, Ph.D.',
    enrolled: false,
    description: 'Supervised & unsupervised learning, classification, neural networks, computer vision overview.',
    rpsUrl: 'RPS_TIF310_ML.pdf',
  },
  {
    code: 'TIF-315',
    name: 'Cloud Computing & DevOps Architecture',
    sks: 3,
    semester: 5,
    type: 'Peminatan',
    prerequisite: 'Pemrograman Web & Jarkom',
    lecturer: 'Dr. Aris Thorne, M.Kom.',
    enrolled: false,
    description: 'Containerization dengan Docker, Kubernetes orchestration, CI/CD pipelines, AWS/GCP cloud services.',
    rpsUrl: 'RPS_TIF315_CloudDevops.pdf',
  },
  {
    code: 'UNI-101',
    name: 'Pendidikan Pancasila & Kewarganegaraan',
    sks: 2,
    semester: 2,
    type: 'Wajib Universitas',
    prerequisite: '-',
    lecturer: 'Drs. Subagyo, M.Hum.',
    enrolled: true,
    description: 'Falsafah kebangsaan, konstitusi UUD 1945, etika berbangsa, dan integritas warga negara madani.',
    rpsUrl: 'RPS_UNI101_Pancasila.pdf',
  },
  {
    code: 'TIF-401',
    name: 'Metodologi Penelitian & Pra-Skripsi',
    sks: 2,
    semester: 7,
    type: 'Wajib Prodi',
    prerequisite: 'Telah Lulus Minimal 100 SKS',
    lecturer: 'Dr. Ir. H. Hendra Wijaya',
    enrolled: false,
    description: 'Penyusunan proposal riset, kajian literatur ilmiah, perumusan rumusan masalah, dan sitasi IEEE/APA.',
    rpsUrl: 'RPS_TIF401_Metopen.pdf',
  },
];

export const CourseCatalogScreen: React.FC<CourseCatalogScreenProps> = ({ onNavigate }) => {
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedCourseRps, setSelectedCourseRps] = useState<CatalogCourse | null>(null);
  const [catalogCourses, setCatalogCourses] = useState<CatalogCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const tables = await loadAcademicTables();
        const session = getSessionUser();
        const studentId = session?.reference_id;
        const enrolledClassIds = new Set(
          tables.krs.filter((k) => String(k.mahasiswa_id).trim() === String(studentId || '').trim()).map((k) => String(k.kelas_id).trim())
        );
        const mapped = tables.mata_kuliah.map((mk) => {
          const kelas = tables.kelas.find((k) => String(k.mata_kuliah_id).trim() === String(mk.id).trim());
          const dosen = kelas ? findById(tables.dosen, kelas.dosen_id) : null;
          return {
            code: String(mk.kode || mk.id || '-'),
            name: String(mk.nama || '-'),
            sks: Number(mk.sks) || 0,
            semester: Number(mk.semester) || 0,
            type: String(mk.jenis || 'Wajib Prodi') as CatalogCourse['type'],
            prerequisite: '-',
            lecturer: dosen?.nama || '-',
            enrolled: kelas ? enrolledClassIds.has(String(kelas.id).trim()) : false,
            description: '-',
            rpsUrl: '-',
          };
        });
        setCatalogCourses(mapped);
      } catch (error) {
        console.error('Gagal mengambil katalog mata kuliah:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredCourses = catalogCourses.filter((c) => {
    const matchesSemester = selectedSemester === 'ALL' || c.semester === selectedSemester;
    const matchesType = selectedType === 'ALL' || c.type === selectedType;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSemester && matchesType && matchesSearch;
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
            <span className="material-symbols-outlined text-base">auto_stories</span>
            Kurikulum 2024 Outcome-Based Education (OBE)
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Katalog Mata Kuliah & Distribusi SKS</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Struktur kurikulum S1 Teknik Informatika, silabus mata kuliah, prasyarat pengambilan, dan Rencana Pembelajaran Semester (RPS).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => triggerToast('Buku Pedoman Akademik & Struktur Kurikulum 2024 berhasil diunduh.')}
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Unduh Buku Kurikulum
          </button>
          <button
            onClick={() => onNavigate('course-detail')}
            className="px-4 py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">school</span>
            Buka Kelas Aktif Saya
          </button>
        </div>
      </div>

      {/* Curriculum Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Total Beban Studi</span>
            <span className="material-symbols-outlined text-primary">school</span>
          </div>
          <div className="text-3xl font-bold text-on-surface">{catalogCourses.reduce((sum, c) => sum + c.sks, 0)} SKS</div>
          <div className="text-xs text-on-surface-variant mt-1">Standar Sarjana Komputer (S.Kom.)</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Mata Kuliah Wajib</span>
            <span className="material-symbols-outlined text-emerald-600">verified</span>
          </div>
          <div className="text-3xl font-bold text-emerald-700">120 SKS</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Wajib Prodi & Universitas</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Peminatan / Elektif</span>
            <span className="material-symbols-outlined text-amber-600">tune</span>
          </div>
          <div className="text-3xl font-bold text-amber-700">24 SKS</div>
          <div className="text-xs text-on-surface-variant mt-1">AI, Cloud, Cyber Sec & Data</div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-xs font-semibold uppercase">Durasi Ideal</span>
            <span className="material-symbols-outlined text-indigo-600">timelapse</span>
          </div>
          <div className="text-3xl font-bold text-indigo-700">8 Semester</div>
          <div className="text-xs text-on-surface-variant mt-1">Program 3.5 s/d 4.0 Tahun</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Semester Selector */}
          <select
            value={selectedSemester === 'ALL' ? 'ALL' : String(selectedSemester)}
            onChange={(e) => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="px-3.5 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Semua Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4 (Semester Berjalan)</option>
            <option value="5">Semester 5</option>
            <option value="7">Semester 7</option>
          </select>

          {/* Type Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Wajib Prodi">Wajib Prodi</option>
            <option value="Wajib Universitas">Wajib Universitas</option>
            <option value="Peminatan">Peminatan / Elektif</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
          <input
            type="text"
            placeholder="Cari kode MK, nama mata kuliah, dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-surface-container-high rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((c) => {
          const isEnrolled = c.enrolled;
          return (
            <div
              key={c.code}
              className="bg-surface-container-lowest rounded-2xl border border-surface-container-high shadow-sm p-5 flex flex-col justify-between hover:border-primary/50 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-surface-container-high text-on-surface font-mono font-bold text-xs rounded-lg">
                    {c.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-container text-on-primary-container">
                      {c.sks} SKS
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-container text-on-surface-variant">
                      Sem. {c.semester}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-on-surface-variant font-medium mt-1">
                  Dosen: <span className="text-on-surface">{c.lecturer}</span>
                </p>

                <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="mt-4 pt-3 border-t border-surface-container-high/60 space-y-1.5 text-xs text-on-surface-variant">
                  <div className="flex items-center justify-between">
                    <span>Jenis MK:</span>
                    <span className="font-semibold text-on-surface">{c.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prasyarat:</span>
                    <span className="font-semibold text-on-surface">{c.prerequisite}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-container-high/60 flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => setSelectedCourseRps(c)}
                  className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container text-on-surface text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">description</span>
                  Lihat RPS
                </button>

                {isEnrolled ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Terdaftar di KRS
                  </span>
                ) : (
                  <button
                    onClick={() => triggerToast(`Mata kuliah ${c.name} ditambahkan ke draf rencana studi!`)}
                    className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Pilih Mata Kuliah
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* RPS Detail Modal */}
      {selectedCourseRps && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl p-6 border border-surface-container-high shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedCourseRps(null)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded">
                  {selectedCourseRps.code}
                </span>
                <span className="text-xs text-on-surface-variant font-semibold">
                  {selectedCourseRps.sks} SKS • Semester {selectedCourseRps.semester}
                </span>
              </div>
              <h2 className="text-xl font-bold text-on-surface">{selectedCourseRps.name}</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">Dosen Pengampu: {selectedCourseRps.lecturer}</p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl space-y-3 text-xs">
              <div>
                <span className="font-bold text-on-surface block mb-1">Deskripsi & Capaian Pembelajaran (CPMK):</span>
                <p className="text-on-surface-variant leading-relaxed">{selectedCourseRps.description}</p>
              </div>

              <div>
                <span className="font-bold text-on-surface block mb-1">Bobot Penilaian Asesmen:</span>
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-2 bg-surface-container rounded-lg">
                    <div className="text-[10px] text-on-surface-variant uppercase">Tugas / Proyek</div>
                    <div className="font-bold text-primary">30%</div>
                  </div>
                  <div className="p-2 bg-surface-container rounded-lg">
                    <div className="text-[10px] text-on-surface-variant uppercase">Kuis & Praktikum</div>
                    <div className="font-bold text-primary">20%</div>
                  </div>
                  <div className="p-2 bg-surface-container rounded-lg">
                    <div className="text-[10px] text-on-surface-variant uppercase">UTS</div>
                    <div className="font-bold text-primary">25%</div>
                  </div>
                  <div className="p-2 bg-surface-container rounded-lg">
                    <div className="text-[10px] text-on-surface-variant uppercase">UAS</div>
                    <div className="font-bold text-primary">25%</div>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-on-surface block mb-1">Prasyarat Kelulusan Mata Kuliah:</span>
                <p className="text-on-surface-variant">{selectedCourseRps.prerequisite}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-on-surface-variant flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-sm">attachment</span>
                {selectedCourseRps.rpsUrl}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCourseRps(null)}
                  className="px-4 py-2 border border-surface-container-high rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container-low cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    triggerToast(`Mengunduh ${selectedCourseRps.rpsUrl}...`);
                    setSelectedCourseRps(null);
                  }}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Unduh Dokumen RPS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
