export type UserRole = 'lecturer' | 'student' | 'admin';

export type ScreenId =
  | 'login'
  | 'dashboard-lecturer'
  | 'dashboard-student'
  | 'dashboard-admin'
  | 'course-detail'
  | 'attendance-recap'
  | 'academic-roster'
  | 'course-catalog'
  | 'gradebook'
  | 'class-schedules'
  | 'student-advising';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  identifier: string; // NIM or NIDN or admin username
  department: string;
  faculty: string;
  avatarUrl: string;
  semester: string;
  activeStatus: string;
  advisorName?: string;
  gpa?: number;
  totalSks?: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  sks: number;
  type: string; // 'Wajib Prodi' | 'Wajib Universitas' | 'Peminatan'
  classSection: string;
  lecturer: string;
  studentsCount: number;
  topic: string;
  schedule: string;
  room: string;
  imageUrl: string;
  syllabusProgress: number; // e.g. 50
  completedSessions: number; // e.g. 7
  totalSessions: number; // e.g. 14
}

export interface AssignmentItem {
  id: string;
  title: string;
  courseName: string;
  classSection: string;
  deadline: string;
  deadlineRelative: string;
  format: string;
  submittedCount: number;
  totalCount: number;
  unreviewedCount: number;
  status: 'closed' | 'open' | 'graded';
}

export interface StudentSubmission {
  id: string;
  assignmentNumber: string;
  title: string;
  score?: number;
  status: 'graded' | 'pending' | 'draft';
  lecturerComment?: string;
  submissionDate: string;
}

export interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  sessionNumber: number;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';
  statusLabel: string;
  topic: string;
  date: string;
  time: string;
  lecturer: string;
  checkInTime?: string;
  location: string;
  isGeotagged: boolean;
  notes?: string;
  attachmentName?: string;
  approvalStatus?: string;
}

export interface StudentRosterItem {
  id: string;
  name: string;
  nim: string;
  email: string;
  prodi: string;
  angkatan: string;
  classSection: string;
  gpa: number;
  passedSks: number;
  advisor: string;
  advisorGroup: string;
  krsStatus: 'approved' | 'pending' | 'unregistered' | 'leave';
  krsSks: number;
  attendanceRate: number;
  avatarUrl?: string;
}

export interface GradeItem {
  id: string;
  studentName: string;
  nim: string;
  avatarUrl: string;
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
  presensi: number;
  nilaiAkhir: number;
  gradeLetter: 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'E';
  status: 'Lulus' | 'Remedial' | 'Gagal';
}

export interface AdvisingStudentItem {
  id: string;
  name: string;
  nim: string;
  prodi: string;
  semester: number;
  year: string;
  gpa: number;
  plannedSks: number;
  maxSks: number;
  status: 'pending' | 'approved' | 'revision';
  isCritical: boolean;
  isThesisReady?: boolean;
  avatarUrl: string;
  lastAdvisingDate: string;
  lastAdvisingNote: string;
  gpaHistory: number[];
  plannedCourses: string[];
  thesisTitle?: string;
  thesisProgress?: number;
}

export interface ScheduleEvent {
  id: string;
  courseCode: string;
  courseName: string;
  classSection: string;
  lecturer: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  startTime: string;
  endTime: string;
  room: string;
  roomType: 'lab' | 'theory' | 'auditorium' | 'office';
  type: 'Praktikum' | 'Teori' | 'Konseling' | 'Kolokium';
  studentsCount: number;
  status: 'ongoing' | 'upcoming' | 'completed';
}
