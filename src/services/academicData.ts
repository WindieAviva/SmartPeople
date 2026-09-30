import { getData } from './api';

export type AcademicTables = {
  users: any[];
  mahasiswa: any[];
  dosen: any[];
  program_studi: any[];
  mata_kuliah: any[];
  kelas: any[];
  jadwal: any[];
  krs: any[];
  materi: any[];
  tugas: any[];
  pengumpulan_tugas: any[];
  absensi: any[];
  nilai: any[];
  bimbingan: any[];
};

const TABLE_NAMES: (keyof AcademicTables)[] = [
  'users', 'mahasiswa', 'dosen', 'program_studi', 'mata_kuliah', 'kelas',
  'jadwal', 'krs', 'materi', 'tugas', 'pengumpulan_tugas', 'absensi', 'nilai', 'bimbingan'
];

export async function loadAcademicTables(): Promise<AcademicTables> {
  const values = await Promise.all(TABLE_NAMES.map((table) => getData(table)));
  return TABLE_NAMES.reduce((acc, table, index) => {
    acc[table] = values[index] || [];
    return acc;
  }, {} as AcademicTables);
}

export function getSessionUser(): any | null {
  try {
    const raw = localStorage.getItem('smartpeople_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function findById(rows: any[], id: any): any | null {
  if (id === undefined || id === null || id === '') return null;
  return rows.find((row) => String(row.id).trim() === String(id).trim()) || null;
}

export function getCurrentStudent(tables: AcademicTables, session = getSessionUser()): any | null {
  const referenceId = session?.reference_id;
  return findById(tables.mahasiswa, referenceId);
}

export function getCurrentLecturer(tables: AcademicTables, session = getSessionUser()): any | null {
  const referenceId = session?.reference_id;
  return findById(tables.dosen, referenceId);
}

export function joinCourse(tables: AcademicTables, kelas: any) {
  const mataKuliah = findById(tables.mata_kuliah, kelas?.mata_kuliah_id);
  const dosen = findById(tables.dosen, kelas?.dosen_id);
  const jadwal = tables.jadwal.find((j) => String(j.kelas_id).trim() === String(kelas?.id).trim());
  const prodi = mataKuliah ? findById(tables.program_studi, mataKuliah.prodi_id) : null;
  return { ...kelas, mataKuliah, dosen, jadwal, prodi };
}

export function studentCourses(tables: AcademicTables, studentId: string) {
  return tables.krs
    .filter((k) => String(k.mahasiswa_id).trim() === String(studentId).trim())
    .map((k) => ({ ...k, course: joinCourse(tables, findById(tables.kelas, k.kelas_id)) }))
    .filter((k) => k.course?.id);
}

export function lecturerCourses(tables: AcademicTables, lecturerId: string) {
  return tables.kelas
    .filter((k) => String(k.dosen_id).trim() === String(lecturerId).trim())
    .map((k) => joinCourse(tables, k));
}

export function formatDay(value: any): 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' {
  const normalized = String(value || '').trim().toLowerCase();
  const map: Record<string, any> = {
    senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis', jumat: 'Jumat', sabtu: 'Jumat',
  };
  return map[normalized] || 'Senin';
}

export function statusToGrade(status: any) {
  const s = String(status || '').toLowerCase();
  if (s.includes('lulus')) return 'Lulus';
  if (s.includes('remedial')) return 'Remedial';
  return 'Gagal';
}

export function calculateFinalGrade(row: any) {
  const direct = Number(row?.nilai_akhir);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const tugas = Number(row?.tugas) || 0;
  const kuis = Number(row?.kuis) || 0;
  const uts = Number(row?.uts) || 0;
  const uas = Number(row?.uas) || 0;
  const presensi = Number(row?.presensi) || 0;
  const hasAny = [tugas, kuis, uts, uas, presensi].some((n) => n > 0);
  if (!hasAny) return 0;
  return Number((tugas * 0.2 + kuis * 0.1 + uts * 0.25 + uas * 0.35 + presensi * 0.1).toFixed(2));
}

export function gradeLetter(value: number): any {
  if (value >= 85) return 'A';
  if (value >= 80) return 'A-';
  if (value >= 75) return 'B+';
  if (value >= 70) return 'B';
  if (value >= 65) return 'B-';
  if (value >= 60) return 'C+';
  if (value >= 55) return 'C';
  if (value >= 45) return 'D';
  return 'E';
}

export function safeNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
