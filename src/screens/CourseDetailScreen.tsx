import React, { useState } from 'react';
import { ScreenId } from '../types';

interface CourseDetailScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'materi' | 'tugas' | 'presensi' | 'nilai'>('tugas');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: 'lecturer' | 'student'; text: string; time: string }[]>([
    {
      sender: 'lecturer',
      text: 'Halo Dimas! Silakan sampaikan pertanyaan atau kendala seputar Tugas Praktikum 04 atau materi perkuliahan Pemrograman Web.',
      time: '10:15 WIB',
    },
    {
      sender: 'student',
      text: 'Selamat siang Pak Dr. Aris, mohon izin konfirmasi apakah pembuatan refresh token di Tugas 4 wajib disimpan di tabel MySQL terpisah?',
      time: '10:18 WIB',
    },
    {
      sender: 'lecturer',
      text: 'Ya, disarankan menggunakan tabel terpisah (misal: refresh_tokens) dengan foreign key ke id user agar bisa di-revoke sewaktu-waktu.',
      time: '10:22 WIB',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'student',
        text: chatInput,
        time: 'Baru saja',
      },
    ]);
    setChatInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setSelectedFile({ name: file.name, size: `${sizeMb} MB` });
    }
  };

  const executeFinalSubmit = () => {
    setShowConfirmModal(false);
    setIsSubmitted(true);
    alert('Tugas praktikum Anda berhasil dikirimkan ke dosen pengampu! Status: Menunggu Koreksi.');
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
        <button
          onClick={() => onNavigate('dashboard-student')}
          className="hover:text-secondary transition-colors cursor-pointer"
        >
          Beranda
        </button>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <button
          onClick={() => onNavigate('course-catalog')}
          className="hover:text-secondary transition-colors cursor-pointer"
        >
          Mata Kuliah Saya
        </button>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary font-bold">TIF-204 Pemrograman Web</span>
      </nav>

      {/* Hero Banner: Course Identity & Metrics */}
      <section className="bg-primary text-on-primary rounded-xl p-space-lg shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-48 bottom-0 w-64 h-64 bg-tertiary-fixed-dim/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row justify-between gap-space-lg items-start xl:items-center">
          <div className="flex flex-col gap-space-sm max-w-3xl">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm tracking-wide font-semibold">
                Mata Kuliah Wajib Prodi
              </span>
              <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">
                Semester 4
              </span>
              <span className="px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm">
                3 SKS (Teori 2, Praktik 1)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span> TA 2025/2026 Genap
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-primary tracking-tight font-bold">
              TIF-204 — Pemrograman Web Komprehensif
            </h1>
            <div className="flex flex-wrap items-center gap-space-md text-on-primary-container font-body-md text-body-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-fixed">schedule</span>
                <span>Senin, 08:00 – 10:30 WIB</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-fixed">meeting_room</span>
                <span>Lab Komputer 3 (Gedung B Lt. 2)</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-fixed">hub</span>
                <span>Ruang Maya Class: #PW-2025-G</span>
              </div>
            </div>
          </div>

          {/* Lecturer Mini Profile Card */}
          <div className="flex items-center gap-space-md bg-primary-container/80 backdrop-blur-md p-space-md rounded-lg shadow-sm w-full xl:w-auto border border-outline/20">
            <img
              alt="Dr. Aris Thorne"
              className="w-14 h-14 rounded-full object-cover shadow-md"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_H6gZH5DYH4SBcu0hGeSUpBdV4lshncTD0tU7BrNKvThLdZCfJqNAE0L8Rd8OHqYSeWCD9ZP-7r9DOjl6D3A4d-5D22n2imIIrwkVlJvwar1Dloda6OAyoDvwMd2ZtSruow2Cabrua8z7p-Arta43lGPXEfYL-gg7Tf7l7F4Zl9pGHMVJ0-YjywRSfkE0Uj4De5MR-DzZP5eE2duaoRTVBpakSqy4B6HvqDoi9bQt285Th-zTgKplXg"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider font-semibold">
                Dosen Pengampu Utama
              </span>
              <span className="font-title-md text-title-md text-on-primary font-bold truncate">
                Dr. Aris Thorne, M.Kom.
              </span>
              <span className="font-body-sm text-body-sm text-on-primary-container">
                NIDN: 0418098201 • Ruang Dosen 304
              </span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setShowChatModal(true)}
                  className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary-container text-on-secondary font-label-sm text-label-sm flex items-center gap-1 transition-all cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-sm">chat</span> Konsultasi
                </button>
                <span className="font-label-sm text-[11px] text-tertiary-fixed-dim">
                  Konsultasi: Rab &amp; Jum (13:00)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Academic Health Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm mt-space-lg pt-space-md bg-primary-container/40 -mx-space-lg -mb-space-lg px-space-lg py-space-md rounded-b-xl border-t border-outline/10">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-secondary-fixed">
              <span className="material-symbols-outlined">timelapse</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-primary-container">
                Progres Perkuliahan
              </p>
              <p className="font-title-md text-title-md text-on-primary font-bold">
                Minggu ke-9{' '}
                <span className="text-sm font-normal text-on-primary-container">/ 16 (56%)</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-tertiary-fixed">
              <span className="material-symbols-outlined">how_to_reg</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-primary-container">
                Presensi Mahasiswa
              </p>
              <p className="font-title-md text-title-md text-on-primary font-bold">
                94.4%{' '}
                <span className="text-xs px-1.5 py-0.5 rounded bg-tertiary text-tertiary-fixed font-semibold">
                  Aman UAS
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-secondary-fixed-dim">
              <span className="material-symbols-outlined">grade</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-primary-container">
                Nilai Kumulatif Sementara
              </p>
              <p className="font-title-md text-title-md text-on-primary font-bold">
                88.50{' '}
                <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-semibold">
                  Grade A-
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined">assignment_late</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-primary-container">
                Tugas Menunggu Kirim
              </p>
              <p className="font-title-md text-title-md text-error-container font-bold">
                {isSubmitted ? '0 Tugas' : '1 Tugas'}{' '}
                <span className="text-xs text-on-primary-container font-normal">
                  {isSubmitted ? '(Tuntas)' : '(Deadline Besok)'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Internal Navigation Tabs */}
      <div className="bg-surface-container-lowest rounded-lg shadow-sm p-1.5 flex flex-wrap gap-1 items-center border border-surface-container">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-secondary text-on-secondary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-lg">overview</span>
          <span>Overview &amp; Silabus</span>
        </button>
        <button
          onClick={() => setActiveTab('materi')}
          className={`px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs cursor-pointer ${
            activeTab === 'materi'
              ? 'bg-secondary text-on-secondary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-lg">folder</span>
          <span>Materi Perkuliahan</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs font-semibold">
            12
          </span>
        </button>
        <button
          onClick={() => setActiveTab('tugas')}
          className={`px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs cursor-pointer ${
            activeTab === 'tugas'
              ? 'bg-secondary text-on-secondary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-lg">assignment</span>
          <span>Tugas &amp; Pengumpulan</span>
          <span className="px-1.5 py-0.5 rounded-full bg-error text-on-error font-label-sm text-xs font-semibold">
            1 Aktif
          </span>
        </button>
        <button
          onClick={() => setActiveTab('presensi')}
          className={`px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs cursor-pointer ${
            activeTab === 'presensi'
              ? 'bg-secondary text-on-secondary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-lg">fact_check</span>
          <span>Presensi &amp; Rekap</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs font-semibold">
            94.4%
          </span>
        </button>
        <button
          onClick={() => setActiveTab('nilai')}
          className={`px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-all flex items-center gap-space-xs cursor-pointer ${
            activeTab === 'nilai'
              ? 'bg-secondary text-on-secondary shadow-sm font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-lg">bar_chart</span>
          <span>Rincian &amp; Komponen Nilai</span>
        </button>
      </div>

      {/* Main Content Body: 12-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
        {/* LEFT / MAIN PANE (8 Columns) */}
        <div className="xl:col-span-8 flex flex-col gap-space-lg">
          {activeTab === 'tugas' && (
            <>
              {/* Urgent Deadline Banner */}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-surface-container">
                <div className="flex items-center gap-space-md">
                  <div className="w-12 h-12 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">alarm</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-error text-on-error font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                        Prioritas Utama
                      </span>
                      <span className="font-label-sm text-label-sm text-error font-semibold">
                        Tersisa 1 Hari 4 Jam
                      </span>
                    </div>
                    <p className="font-title-md text-title-md text-on-surface font-bold mt-0.5">
                      Batas Pengumpulan: Selasa, 25 Maret 2025, 23:59 WIB
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Sistem mengunci pengunggahan berkas secara otomatis setelah batas waktu terlewati.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-1.5 ${
                      isSubmitted
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed font-bold'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isSubmitted ? 'bg-on-tertiary-fixed' : 'bg-error'}`}
                    ></span>
                    {isSubmitted ? 'Sudah Dikumpulkan' : 'Belum Dikumpulkan'}
                  </span>
                </div>
              </div>

              {/* Assignment Brief Card */}
              <article className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                      Tugas Praktikum 04 • Pertemuan 9
                    </span>
                    <h2 className="font-headline-md text-headline-md text-primary font-bold mt-1">
                      Implementasi RESTful API Autentikasi Pengguna Menggunakan JWT &amp; MySQL
                    </h2>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Bobot Evaluasi
                    </span>
                    <span className="font-headline-md text-headline-md text-primary font-bold">
                      15%{' '}
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        dari Nilai Akhir
                      </span>
                    </span>
                  </div>
                </div>

                <div className="h-px w-full bg-surface-container"></div>

                {/* Assignment Description & Specific Steps */}
                <div className="text-on-surface font-body-md text-body-md flex flex-col gap-space-sm leading-relaxed">
                  <p>
                    Pada penugasan praktikum ini, Anda diminta merancang arsitektur backend REST API berbasis
                    arsitektur model-view-controller menggunakan Node.js (Express) atau PHP (Laravel) dengan basis
                    data relasional MySQL. Modul yang dikembangkan bertugas menangani siklus hidup autentikasi pengguna secara aman.
                  </p>
                  <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-xs text-on-surface">
                    <span className="font-label-md text-label-md text-primary font-bold">
                      Capaian Pembelajaran Khusus:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-on-surface-variant font-body-md text-body-md">
                      <li>
                        Membuat skema basis data{' '}
                        <code className="font-code-sm text-code-sm bg-surface-variant px-1 rounded">
                          users
                        </code>
                        ,{' '}
                        <code className="font-code-sm text-code-sm bg-surface-variant px-1 rounded">
                          roles
                        </code>
                        , dan{' '}
                        <code className="font-code-sm text-code-sm bg-surface-variant px-1 rounded">
                          refresh_tokens
                        </code>{' '}
                        dengan relasi foreign key integritas tinggi.
                      </li>
                      <li>
                        Menerapkan algoritma keamanan enkripsi kata sandi menggunakan{' '}
                        <code className="font-code-sm text-code-sm bg-surface-variant px-1 rounded">
                          bcrypt
                        </code>{' '}
                        (Salt round min. 10).
                      </li>
                      <li>
                        Menghasilkan dan memvalidasi JSON Web Token (JWT) dengan skema masa berlaku Access Token (15 menit) dan Refresh Token (7 hari).
                      </li>
                      <li>
                        Menyediakan middleware proteksi rute untuk hak akses role:{' '}
                        <code className="font-code-sm text-code-sm bg-surface-variant px-1 rounded">
                          admin
                        </code>{' '}
                        dan{' '}
                        <code className="font-code-sm text-code-sm bg-surface-variant px-1 rounded">
                          mahasiswa
                        </code>
                        .
                      </li>
                    </ul>
                  </div>

                  {/* Downloadable Course Attachments */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                      Lampiran Pendukung Dari Dosen
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                      <a
                        href="#download"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Mengunduh Modul-04_REST_API_JWT.pdf (2.4 MB)');
                        }}
                        className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">picture_as_pdf</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-primary font-bold truncate group-hover:text-secondary">
                            Modul-04_REST_API_JWT.pdf
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            2.4 MB • Pedoman Lengkap
                          </span>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-on-surface-variant">
                          download
                        </span>
                      </a>

                      <a
                        href="#download"
                        onClick={(e) => {
                          e.preventDefault();
                          alert('Mengunduh Postman_Collection_Auth.json (148 KB)');
                        }}
                        className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">folder_zip</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-primary font-bold truncate group-hover:text-secondary">
                            Postman_Collection_Auth.json
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            148 KB • Test Suite API
                          </span>
                        </div>
                        <span className="material-symbols-outlined ml-auto text-on-surface-variant">
                          download
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </article>

              {/* SUBMISSION FORM: Drag and Drop & Response Input */}
              <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-2xl">
                      cloud_upload
                    </span>
                    <h3 className="font-title-md text-title-md text-primary font-bold">
                      Formulir Pengumpulan Tugas Mandiri
                    </h3>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Format diterima: ZIP, RAR, PDF (Maks. 25 MB)
                  </span>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!selectedFile) {
                      alert('Silakan pilih berkas tugas terlebih dahulu sebelum mengirim.');
                      return;
                    }
                    setShowConfirmModal(true);
                  }}
                  className="flex flex-col gap-space-md"
                >
                  {/* Dropzone Box */}
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer border-2 border-dashed border-outline-variant hover:border-secondary rounded-xl p-space-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col items-center justify-center text-center group"
                  >
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-110 transition-transform mb-space-sm">
                      <span className="material-symbols-outlined text-3xl">upload_file</span>
                    </div>

                    {selectedFile ? (
                      <div className="p-space-sm bg-surface-container-lowest rounded-lg shadow-sm flex items-center gap-space-sm text-left">
                        <span className="material-symbols-outlined text-secondary text-2xl">
                          check_circle
                        </span>
                        <div>
                          <p className="font-label-md text-label-md text-primary font-bold">
                            {selectedFile.name}
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {selectedFile.size} • Siap diunggah (Klik untuk mengganti)
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                          className="p-1 rounded-full hover:bg-error-container text-error ml-space-md cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-title-md text-title-md text-primary font-bold">
                          Klik untuk memilih berkas atau seret berkas ke area ini
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Berkas arsip proyek lengkap beserta file dokumentasi ekspor Postman
                        </p>
                      </>
                    )}
                  </label>

                  {/* Repository / Live API URL */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="repoUrl"
                      className="font-label-md text-label-md text-primary font-bold flex items-center gap-1"
                    >
                      <span>Tautan Repositori GitHub / GitLab</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                        (Opsional)
                      </span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                        link
                      </span>
                      <input
                        id="repoUrl"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/username/rest-api-mahasiswa-jwt"
                        type="url"
                        className="w-full pl-10 pr-space-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-secondary transition-all"
                      />
                    </div>
                  </div>

                  {/* Notes for Lecturer */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="submissionNotes" className="font-label-md text-label-md text-primary font-bold">
                      Catatan / Komentar Tambahan untuk Dosen
                    </label>
                    <textarea
                      id="submissionNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Lampiran mencakup seed data akun default untuk pengujian: admin@kampus.ac.id (password: admin123). Dependensi telah didokumentasikan pada README.md..."
                      rows={3}
                      className="w-full p-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-secondary transition-all resize-y"
                    ></textarea>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
                    <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-sm text-tertiary-fixed-variant">
                        lock
                      </span>
                      <span>Enkripsi transmisi SSL 256-bit SIAK aman</span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <button
                        type="button"
                        onClick={() => alert('Draf pengumpulan tugas berhasil disimpan ke server lokal.')}
                        className="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">save</span>
                        <span>Simpan Draf</span>
                      </button>
                      <button
                        type="submit"
                        className={`px-space-lg py-2.5 rounded-lg font-label-md text-label-md shadow-md transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                          isSubmitted
                            ? 'bg-tertiary-container text-tertiary-fixed'
                            : 'bg-secondary hover:bg-secondary-container text-on-secondary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {isSubmitted ? 'check' : 'send'}
                        </span>
                        <span>{isSubmitted ? 'Berhasil Dikirimkan' : 'Kirimkan Tugas Sekarang'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </section>

              {/* Previous Assignments History in this Course */}
              <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
                <div className="flex items-center justify-between">
                  <h3 className="font-title-md text-title-md text-primary font-bold">
                    Histori Evaluasi &amp; Riwayat Tugas Mata Kuliah
                  </h3>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold">
                    3 dari 4 Tugas Selesai
                  </span>
                </div>

                <div className="flex flex-col gap-space-sm">
                  {/* Assignment Item 1 */}
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md">
                    <div className="flex items-start gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">task_alt</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                            Tugas 01
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface text-tertiary-fixed-variant font-label-sm text-xs font-semibold">
                            Telah Dinilai
                          </span>
                        </div>
                        <h4 className="font-title-md text-title-md text-primary font-bold mt-0.5">
                          Struktur Dokumen Web Semantik HTML5 &amp; Form Audit
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          <span className="font-semibold text-primary">Komentar Dosen:</span> &quot;Struktur
                          semantic tag sangat rapi, pemanfaatan aria-label pada form sudah tepat.&quot;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-lg shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Nilai Diperoleh
                        </span>
                        <p className="font-headline-md text-headline-md text-primary font-bold">
                          95 <span className="font-body-sm text-body-sm text-on-surface-variant">/ 100</span>
                        </p>
                      </div>
                      <button
                        onClick={() => alert('Nilai: 95/100 (A)\nFeedback Dosen: Semantic tag rapi & responsive.')}
                        className="p-2 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </div>

                  {/* Assignment Item 2 */}
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md">
                    <div className="flex items-start gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-tertiary text-on-tertiary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">task_alt</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                            Tugas 02
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface text-tertiary-fixed-variant font-label-sm text-xs font-semibold">
                            Telah Dinilai
                          </span>
                        </div>
                        <h4 className="font-title-md text-title-md text-primary font-bold mt-0.5">
                          Tata Letak Responsif Menggunakan CSS3 Flexbox &amp; Grid
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          <span className="font-semibold text-primary">Komentar Dosen:</span> &quot;Tampilan
                          breakpoint ponsel sempurna. Penulisan clean CSS memuaskan.&quot;
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-lg shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Nilai Diperoleh
                        </span>
                        <p className="font-headline-md text-headline-md text-primary font-bold">
                          90 <span className="font-body-sm text-body-sm text-on-surface-variant">/ 100</span>
                        </p>
                      </div>
                      <button
                        onClick={() => alert('Nilai: 90/100 (A-)\nFeedback Dosen: Breakpoint mobile responsif memuaskan.')}
                        className="p-2 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </div>

                  {/* Assignment Item 3 */}
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col md:flex-row justify-between items-start md:items-center gap-space-md">
                    <div className="flex items-start gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">hourglass_top</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                            Tugas 03
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-xs font-semibold">
                            Sedang Dikoreksi Dosen
                          </span>
                        </div>
                        <h4 className="font-title-md text-title-md text-primary font-bold mt-0.5">
                          Desain Basis Data Relasional &amp; Skema Normalisasi 3NF
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Dikumpulkan: 18 Maret 2025, 21:14 WIB • Menunggu penilaian Dr. Aris Thorne
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-lg shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Status Nilai
                        </span>
                        <p className="font-title-md text-title-md text-secondary font-bold">
                          Menunggu
                        </p>
                      </div>
                      <button
                        onClick={() => alert('Status Penilaian: Berkas sedang diperiksa oleh Dr. Aris Thorne.')}
                        className="p-2 rounded-lg bg-surface hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined">receipt_long</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'overview' && (
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
              <h3 className="font-headline-md text-headline-md text-primary font-bold">
                Silabus &amp; Rencana Pembelajaran Semester (RPS)
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Mata kuliah Pemrograman Web memberikan pemahaman mendalam tentang pengembangan aplikasi web modern
                sisi klien dan server, arsitektur REST, basis data, serta standar pengamanan aplikasi berbasis web.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-sm">
                <div className="p-space-md rounded-lg bg-surface-container-low">
                  <span className="font-label-md text-label-md text-primary font-bold">
                    Capaian Pembelajaran (CPL):
                  </span>
                  <ul className="list-disc list-inside mt-2 font-body-sm text-body-sm text-on-surface-variant space-y-1">
                    <li>Mampu merancang antarmuka web interaktif yang ramah pengguna.</li>
                    <li>Mampu membangun API backend yang terukur dan aman.</li>
                    <li>Menguasai teknik integrasi database relasional dan non-relasional.</li>
                  </ul>
                </div>
                <div className="p-space-md rounded-lg bg-surface-container-low">
                  <span className="font-label-md text-label-md text-primary font-bold">
                    Pustaka Utama:
                  </span>
                  <ul className="list-disc list-inside mt-2 font-body-sm text-body-sm text-on-surface-variant space-y-1">
                    <li>Robbins, J. N. (2018). Learning Web Design: 5th Edition. O&apos;Reilly.</li>
                    <li>Flanagan, D. (2020). JavaScript: The Definitive Guide. O&apos;Reilly.</li>
                    <li>Dokumentasi Resmi Node.js &amp; RFC 7519 JSON Web Token.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'materi' && (
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
              <h3 className="font-headline-md text-headline-md text-primary font-bold">
                Daftar Materi Perkuliahan (Pertemuan 1 - 16)
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { title: 'Pertemuan 01 - Pengenalan Ekosistem Web Modern & HTTP/HTTPS', meta: 'Slide Presentasi • PDF (3.1 MB)' },
                  { title: 'Pertemuan 02 - HTML5 Semantik, Aksesibilitas Web (a11y) & SEO', meta: 'Slide Presentasi • PDF (2.8 MB)' },
                  { title: 'Pertemuan 08 - Dasar RESTful API & Arsitektur Microservices', meta: 'Materi Kuliah • PPTX (5.4 MB)' },
                  { title: 'Pertemuan 09 - Keamanan Autentikasi JWT & Role Based Access Control', meta: 'Materi Praktikum Terkini • PDF (4.2 MB)' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-secondary">description</span>
                      <div>
                        <p className="font-label-md text-label-md text-primary font-bold">{m.title}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{m.meta}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Mengunduh berkas materi: ${m.title}`)}
                      className="px-3 py-1.5 rounded-lg bg-surface text-secondary hover:bg-secondary hover:text-on-secondary font-label-sm text-label-sm transition-colors cursor-pointer"
                    >
                      Unduh
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'presensi' && (
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
              <h3 className="font-headline-md text-headline-md text-primary font-bold">
                Catatan Kehadiran Mahasiswa Lengkap
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Syarat minimal keikutsertaan Ujian Akhir Semester (UAS) adalah 75% kehadiran perkuliahan aktif.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
                <div className="p-space-md rounded-lg bg-surface-container-low text-center">
                  <p className="text-3xl text-tertiary-fixed-variant font-bold">9</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Hadir</p>
                </div>
                <div className="p-space-md rounded-lg bg-surface-container-low text-center">
                  <p className="text-3xl text-secondary font-bold">1</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Izin Resmi</p>
                </div>
                <div className="p-space-md rounded-lg bg-surface-container-low text-center">
                  <p className="text-3xl text-on-surface-variant font-bold">0</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Sakit</p>
                </div>
                <div className="p-space-md rounded-lg bg-surface-container-low text-center">
                  <p className="text-3xl text-error font-bold">0</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">Alpa / Bolos</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nilai' && (
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
              <h3 className="font-headline-md text-headline-md text-primary font-bold">
                Transkrip Evaluasi Nilai Sementara
              </h3>
              <div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between">
                <div>
                  <p className="font-title-md text-title-md text-primary font-bold">
                    Prediksi Nilai Akhir: 88.50 (Grade A-)
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Bobot terhitung berdasarkan data penugasan dan kuis yang telah selesai diperiksa.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-tertiary text-on-tertiary font-label-md text-label-md font-semibold">
                  Sangat Memuaskan
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR: Academic Details & Quick Tools (4 Columns) */}
        <div className="xl:col-span-4 flex flex-col gap-space-lg">
          {/* Attendance Widget Card with Progress Ring */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary font-bold uppercase tracking-wider">
                Rekapitulasi Presensi
              </span>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs font-semibold">
                Memenuhi Syarat
              </span>
            </div>
            <div className="flex items-center gap-space-lg">
              {/* Circular SVG Attendance Chart */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  ></path>
                  <path
                    className="text-secondary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="94.4, 100"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  ></path>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline-md text-headline-md text-primary font-bold">
                    94%
                  </span>
                  <span className="font-label-sm text-[9px] text-on-surface-variant uppercase font-semibold">
                    Rasio
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 w-full text-body-sm font-body-sm">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span> Hadir
                  </span>
                  <span className="font-bold text-primary">9 Kali</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span> Izin Resmi
                  </span>
                  <span className="font-bold text-primary">1 Kali</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-surface-variant"></span> Sakit
                  </span>
                  <span className="font-bold text-primary">0 Kali</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-on-surface-variant flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-error"></span> Alpa / Alpha
                  </span>
                  <span className="font-bold text-primary">0 Kali</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grading Component Breakdown Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                Komponen &amp; Bobot Evaluasi
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Total 100%</span>
            </div>
            <div className="flex flex-col gap-space-sm font-body-sm text-body-sm">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-on-surface">
                  <span className="font-semibold">Tugas &amp; Praktikum (20%)</span>
                  <span className="font-bold text-primary">Rata-rata: 92.5</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '92.5%' }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-on-surface">
                  <span className="font-semibold">Kuis Mingguan (10%)</span>
                  <span className="font-bold text-primary">Rata-rata: 85.0</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-secondary-container h-full rounded-full"
                    style={{ width: '85%' }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-on-surface">
                  <span className="font-semibold">Ujian Tengah Semester (UTS) (30%)</span>
                  <span className="font-bold text-primary">Nilai: 88.0</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-on-surface">
                  <span className="font-semibold">Ujian Akhir Semester (UAS) (30%)</span>
                  <span className="font-bold text-on-surface-variant">Menunggu Pelaksanaan</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-surface-variant h-full rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-on-surface">
                  <span className="font-semibold">Kehadiran &amp; Partisipasi (10%)</span>
                  <span className="font-bold text-primary">Nilai: 94.4</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-tertiary-fixed-dim h-full rounded-full"
                    style={{ width: '94.4%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Download Recent Learning Resources */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                Materi Perkuliahan Terkini
              </span>
              <button
                onClick={() => setActiveTab('materi')}
                className="font-label-sm text-label-sm text-secondary hover:underline cursor-pointer"
              >
                Semua (12)
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Mengunduh Pertemuan 8 — REST API Architecture.pdf');
                }}
                className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-secondary text-xl">menu_book</span>
                  <div className="truncate">
                    <p className="font-label-md text-label-md text-primary font-bold truncate group-hover:text-secondary">
                      Pertemuan 8 — REST API Architecture
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">PDF • 3.2 MB</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-lg">download</span>
              </a>
              <a
                href="#download"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Mengunduh Pertemuan 9 — JWT Token & OAuth2.pptx');
                }}
                className="p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-secondary text-xl">token</span>
                  <div className="truncate">
                    <p className="font-label-md text-label-md text-primary font-bold truncate group-hover:text-secondary">
                      Pertemuan 9 — JWT Token &amp; OAuth2
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">PPTX • 4.8 MB</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-lg">download</span>
              </a>
            </div>
          </div>

          {/* Class Group & Study Circle Banner */}
          <div className="bg-primary text-on-primary rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm relative overflow-hidden">
            <div className="flex items-center gap-space-xs text-secondary-fixed">
              <span className="material-symbols-outlined">forum</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                Forum Diskusi Kelas
              </span>
            </div>
            <h4 className="font-title-md text-title-md font-bold text-on-primary">
              Ada kendala dalam pengerjaan praktikum?
            </h4>
            <p className="font-body-sm text-body-sm text-on-primary-container">
              Bergabung di kanal diskusi Telegram &amp; forum LMS dengan 42 mahasiswa lainnya dan asisten dosen.
            </p>
            <button
              onClick={() => setShowChatModal(true)}
              className="mt-2 px-space-md py-2 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface text-center font-label-md text-label-md font-bold transition-all cursor-pointer shadow-sm"
            >
              Buka Forum Diskusi (14 Pesan Baru)
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Confirmation for Assignment Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl p-space-xl shadow-2xl flex flex-col gap-space-md">
            <div className="w-14 h-14 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary mx-auto">
              <span className="material-symbols-outlined text-3xl">send</span>
            </div>
            <div className="text-center flex flex-col gap-1">
              <h3 className="font-headline-md text-headline-md text-primary font-bold">
                Kirimkan Berkas Tugas Sekarang?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Pastikan semua source code, basis data dump, dan dokumentasi API sudah berada di dalam arsip ZIP sebelum melakukan finalisasi.
              </p>
            </div>
            <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-1 text-left font-body-sm text-body-sm text-on-surface">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Nama Berkas:</span>
                <span className="font-bold text-primary">{selectedFile?.name || 'Tugas.zip'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Waktu Pengiriman:</span>
                <span className="font-bold text-primary">Sebelum Deadline (Tepat Waktu)</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-space-sm mt-space-sm">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors cursor-pointer"
              >
                Batal &amp; Periksa Lagi
              </button>
              <button
                type="button"
                onClick={executeFinalSubmit}
                className="px-space-lg py-2.5 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md shadow-md transition-all cursor-pointer font-bold"
              >
                Ya, Kirimkan Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Lecturer Chat & Consultation */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-primary text-on-primary p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <img
                  alt="Dr. Aris Thorne"
                  className="w-10 h-10 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrgsMTgtwVvoYPPv7_WE8SkPZqmhe_Gtc2YLenrUAGxvUbrHxbqM8aB5ZOwFpjIIm4q3Mv-f51eNK-ei_MVgtpQ_rouC461JQFykA9C_nNohsVg9E9xUV8gUNdEEU82uTLfUOt7aHu2apmxoZTSzyHllXDxBXC92sLXvJ1GyW4TXYG9hKsJpz3zgvcQZRydBBgzH07u__ZhUy6zwTkJfiUN_nHdcCgoCK_stPKfWM7xM2Gninq7MKKDA"
                />
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-on-primary">
                    Konsultasi Akademik: Dr. Aris Thorne
                  </h4>
                  <span className="font-body-sm text-body-sm text-tertiary-fixed-dim flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span> Online pada jam kerja
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-1 rounded-full hover:bg-primary-container text-on-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-space-lg bg-surface-container-low min-h-64 max-h-96 overflow-y-auto flex flex-col gap-space-md font-body-sm text-body-sm">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-space-sm items-start max-w-md ${
                    msg.sender === 'student' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`p-space-sm rounded-xl shadow-sm ${
                      msg.sender === 'student'
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container-lowest text-on-surface'
                    }`}
                  >
                    {msg.text}
                    <span
                      className={`block text-[10px] mt-1 ${
                        msg.sender === 'student' ? 'text-secondary-fixed text-right' : 'text-on-surface-variant'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-space-md bg-surface-container-lowest flex items-center gap-space-sm border-t border-surface-container"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Tuliskan pesan konsultasi untuk dosen..."
                type="text"
                className="flex-1 px-space-md py-2 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="p-2.5 rounded-lg bg-secondary text-on-secondary hover:bg-secondary-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
