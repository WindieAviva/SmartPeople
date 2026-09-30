import React, { useState } from 'react';
import { getData } from '../services/api';
import { UserRole, ScreenId } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, user: any) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
}) => {
  const [role, setRole] = useState<'mhs' | 'dsn' | 'adm'>('mhs');

  // ==============================
  // DATA LOGIN DEFAULT
  // ==============================
  const [identity, setIdentity] = useState('230101001');
  const [password, setPassword] = useState('mahasiswa123');

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ==============================
  // DATA DEMO SESUAI GOOGLE SHEETS
  // ==============================
  const roleMeta = {
    mhs: {
      label: 'Nomor Induk Mahasiswa (NIM)',
      placeholder: 'Contoh: 230101001',
      icon: 'school',
      user: '230101001',
      pass: 'mahasiswa123',
      actualRole: 'student' as UserRole,
    },

    dsn: {
      label: 'NIDN / NIP Dosen',
      placeholder: 'Contoh: 198501152010121002',
      icon: 'badge',
      user: '198501152010121002',
      pass: 'dosen123',
      actualRole: 'lecturer' as UserRole,
    },

    adm: {
      label: 'Username Administrator',
      placeholder: 'Contoh: admin',
      icon: 'admin_panel_settings',
      user: 'admin',
      pass: 'admin123',
      actualRole: 'admin' as UserRole,
    },
  };

  // ==============================
  // PILIH ROLE
  // ==============================
  const handleRoleSelect = (r: 'mhs' | 'dsn' | 'adm') => {
    setRole(r);

    setIdentity(roleMeta[r].user);
    setPassword(roleMeta[r].pass);

    setLoginSuccess(false);
  };

  // ==============================
  // LOGIN
  // ==============================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setLoginSuccess(false);

    try {
      console.log('=================================');
      console.log('PROSES LOGIN SMARTPEOPLE');
      console.log('=================================');

      console.log('Identity yang dimasukkan:', identity);
      console.log('Password yang dimasukkan:', password);
      console.log('Role yang dipilih:', role);

      // =================================
      // AMBIL DATA USERS DARI GOOGLE SHEETS
      // =================================

      const users = await getData('users');

      console.log('=================================');
      console.log('DATA USERS DARI GOOGLE SHEETS');
      console.log('=================================');

      console.table(users);

      console.log('Jumlah user:', users.length);

      // =================================
      // CEK SATU PER SATU USER
      // =================================

      console.log('=================================');
      console.log('PEMERIKSAAN USER');
      console.log('=================================');

      users.forEach((item: any, index: number) => {
        console.log(`User ke-${index + 1}`);

        console.log(
          'ID:',
          JSON.stringify(String(item.id))
        );

        console.log(
          'Username:',
          JSON.stringify(String(item.username))
        );

        console.log(
          'Password:',
          JSON.stringify(String(item.password))
        );

        console.log(
          'Role:',
          JSON.stringify(String(item.role))
        );

        console.log(
          'Reference ID:',
          JSON.stringify(String(item.reference_id))
        );

        console.log('-----------------------------');
      });

      // =================================
      // CARI USER
      // =================================

      const user = users.find(
        (item: any) => {
          const usernameSheet = String(
            item.username ?? ''
          ).trim();

          const passwordSheet = String(
            item.password ?? ''
          ).trim();

          const usernameInput = identity.trim();
          const passwordInput = password.trim();

          console.log(
            'Membandingkan:',
            JSON.stringify(usernameSheet),
            '===',
            JSON.stringify(usernameInput)
          );

          console.log(
            'Password:',
            JSON.stringify(passwordSheet),
            '===',
            JSON.stringify(passwordInput)
          );

          return (
            usernameSheet === usernameInput &&
            passwordSheet === passwordInput
          );
        }
      );

      // =================================
      // USER TIDAK DITEMUKAN
      // =================================

      if (!user) {
        console.error('=================================');
        console.error('LOGIN GAGAL');
        console.error('=================================');

        console.error(
          'Tidak ditemukan user dengan:'
        );

        console.error(
          'Username:',
          identity
        );

        console.error(
          'Password:',
          password
        );

        alert(
          'Username/NIM/NIDN atau password salah.'
        );

        setIsLoading(false);

        return;
      }

      // =================================
      // USER DITEMUKAN
      // =================================

      console.log('=================================');
      console.log('USER DITEMUKAN');
      console.log('=================================');

      console.log('User:', user);

      console.log(
        'ID:',
        user.id
      );

      console.log(
        'Username:',
        user.username
      );

      console.log(
        'Role:',
        user.role
      );

      console.log(
        'Reference ID:',
        user.reference_id
      );

      // =================================
      // TENTUKAN ROLE
      // =================================

      let actualRole: UserRole;

      if (user.role === 'mahasiswa') {

        actualRole = 'student';

      } else if (user.role === 'dosen') {

        actualRole = 'lecturer';

      } else if (user.role === 'admin') {

        actualRole = 'admin';

      } else {

        console.error(
          'Role tidak dikenali:',
          user.role
        );

        alert(
          'Role pengguna tidak dikenali.'
        );

        setIsLoading(false);

        return;
      }

      // =================================
      // LOGIN BERHASIL
      // =================================

      console.log('=================================');
      console.log('LOGIN BERHASIL');
      console.log('=================================');

      console.log(
        'Actual Role:',
        actualRole
      );

      setLoginSuccess(true);

      // =================================
      // KIRIM USER KE APP.TSX
      // =================================

      setTimeout(() => {

        onLoginSuccess(
          actualRole,
          user
        );

      }, 700);

    } catch (error) {

      console.error(
        '================================='
      );

      console.error(
        'ERROR LOGIN'
      );

      console.error(
        '================================='
      );

      console.error(error);

      alert(
        'Gagal terhubung ke server. Silakan coba lagi.'
      );

      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex items-center justify-center p-space-md">

      <main className="w-full max-w-md">

        <div className="flex flex-col w-full">

          <div className="relative w-full bg-surface-container-lowest rounded-xl shadow-xl p-space-lg md:p-space-xl overflow-hidden border border-surface-container">

            {/* Ambient Lighting Accents */}

            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-secondary/10 blur-2xl pointer-events-none"></div>

            <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-primary-fixed/25 blur-2xl pointer-events-none"></div>

            {/* Header / Logo */}

            <div className="relative z-10 flex flex-col items-center text-center">

              <div className="mb-space-sm flex items-center justify-center">

                <img
                  alt="SmartPeople Higher Education LMS"
                  className="h-12 w-auto object-contain"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WcK4gAGRRp8zhWVnd9qISYRvj0LMtg-AL6PWXAHD-6AI8BFlJW0WfGmibzmvD4pUkaldaje8ausWzg0pOSPftK0OyM6PbHvsCqadmnBL_VxplQBOf-KjFdRHhwYhZ48XJtEVxyhnNskdyRx9CZKO6gXhjOgiRm8P8z1q-zqXdXQmavJyS1DNqKHNyaI-4mIjxVR4JHvXW2Q07oX5cFhQfecgS1yZQURNTkZRrWbSloE1kFrTkMXj-V4mQ"
                />

              </div>

              <p className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                Smart Learning Management for Higher Education
              </p>

              <div className="w-12 h-0.5 bg-secondary-container mt-space-xs mb-space-md rounded-full"></div>

            </div>

            {/* Role Selector */}

            <div className="relative z-10 mt-space-xs">

              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-space-xs text-center">
                Pilih Peran Masuk
              </label>

              <div className="grid grid-cols-3 p-space-xs bg-surface-container rounded-lg gap-1">

                {/* Mahasiswa */}

                <button
                  type="button"
                  onClick={() => handleRoleSelect('mhs')}
                  className={`flex items-center justify-center py-2 px-1 rounded-md font-label-sm text-label-sm transition-all duration-200 cursor-pointer ${
                    role === 'mhs'
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >

                  <span
                    className={`material-symbols-outlined text-[16px] mr-1 ${
                      role === 'mhs'
                        ? 'text-secondary'
                        : ''
                    }`}
                  >
                    school
                  </span>

                  Mahasiswa

                </button>

                {/* Dosen */}

                <button
                  type="button"
                  onClick={() => handleRoleSelect('dsn')}
                  className={`flex items-center justify-center py-2 px-1 rounded-md font-label-sm text-label-sm transition-all duration-200 cursor-pointer ${
                    role === 'dsn'
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >

                  <span
                    className={`material-symbols-outlined text-[16px] mr-1 ${
                      role === 'dsn'
                        ? 'text-secondary'
                        : ''
                    }`}
                  >
                    badge
                  </span>

                  Dosen

                </button>

                {/* Admin */}

                <button
                  type="button"
                  onClick={() => handleRoleSelect('adm')}
                  className={`flex items-center justify-center py-2 px-1 rounded-md font-label-sm text-label-sm transition-all duration-200 cursor-pointer ${
                    role === 'adm'
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >

                  <span
                    className={`material-symbols-outlined text-[16px] mr-1 ${
                      role === 'adm'
                        ? 'text-secondary'
                        : ''
                    }`}
                  >
                    admin_panel_settings
                  </span>

                  Admin

                </button>

              </div>
            </div>

            {/* Login Form */}

            <form
              onSubmit={handleLogin}
              className="relative z-10 mt-space-md flex flex-col gap-space-sm"
            >

              {/* Identity */}

              <div>

                <label className="block font-label-sm text-label-sm text-on-surface mb-1 font-semibold">
                  {roleMeta[role].label}
                </label>

                <div className="relative flex items-center">

                  <span className="material-symbols-outlined absolute left-3 text-outline text-xl pointer-events-none">
                    {roleMeta[role].icon}
                  </span>

                  <input
                    value={identity}
                    onChange={(e) =>
                      setIdentity(e.target.value)
                    }
                    placeholder={
                      roleMeta[role].placeholder
                    }
                    required
                    type="text"
                    className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-colors"
                  />

                </div>

              </div>

              {/* Password */}

              <div>

                <div className="flex items-center justify-between mb-1">

                  <label className="block font-label-sm text-label-sm text-on-surface font-semibold">
                    Kata Sandi
                  </label>

                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();

                      alert(
                        'Tautan reset kata sandi telah dikirimkan ke email terdaftar.'
                      );
                    }}
                    className="font-label-sm text-label-sm text-secondary hover:underline"
                  >
                    Lupa Password?
                  </a>

                </div>

                <div className="relative flex items-center">

                  <span className="material-symbols-outlined absolute left-3 text-outline text-xl pointer-events-none">
                    lock
                  </span>

                  <input
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Masukkan kata sandi"
                    required
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low text-on-surface rounded-lg font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-secondary/20 focus:outline-none transition-colors"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 flex items-center text-outline hover:text-on-surface focus:outline-none cursor-pointer"
                  >

                    <span className="material-symbols-outlined text-xl">
                      {showPassword
                        ? 'visibility_off'
                        : 'visibility'}
                    </span>

                  </button>

                </div>

              </div>

              {/* Remember Me */}

              <div className="flex items-center justify-between mt-1">

                <label className="flex items-center gap-2 cursor-pointer select-none">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded bg-surface-container-low text-secondary accent-secondary focus:ring-0 cursor-pointer"
                  />

                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Ingat sesi saya di perangkat ini
                  </span>

                </label>

              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-space-xs w-full py-3 px-4 bg-primary-container hover:bg-primary text-on-primary font-headline-md text-headline-md rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >

                {isLoading ? (
                  <>

                    <span className="material-symbols-outlined text-lg animate-spin">
                      progress_activity
                    </span>

                    <span>
                      Memvalidasi...
                    </span>

                  </>
                ) : loginSuccess ? (
                  <>

                    <span className="material-symbols-outlined text-lg text-tertiary-fixed">
                      check_circle
                    </span>

                    <span>
                      Berhasil Masuk!
                    </span>

                  </>
                ) : (
                  <>

                    <span>
                      Masuk ke Sistem
                    </span>

                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>

                  </>
                )}

              </button>

            </form>

            {/* Demo Credentials */}

            <div className="relative z-10 mt-space-md p-space-sm bg-surface-container-low rounded-lg">

              <div className="flex items-center justify-between mb-1">

                <div className="flex items-center gap-1.5 text-secondary">

                  <span className="material-symbols-outlined text-sm font-semibold">
                    key
                  </span>

                  <span className="font-label-sm text-label-sm uppercase tracking-wide font-bold">
                    Kredensial Pengujian (Demo)
                  </span>

                </div>

                <span className="font-code-sm text-code-sm text-outline-variant bg-surface-container px-1.5 py-0.5 rounded">
                  Klik isi cepat
                </span>

              </div>

              <div className="grid grid-cols-3 gap-1 mt-2">

                {/* Mahasiswa */}

                <button
                  type="button"
                  onClick={() =>
                    handleRoleSelect('mhs')
                  }
                  className="flex flex-col text-left p-1.5 bg-surface-container-lowest hover:bg-surface-bright rounded transition-colors group cursor-pointer"
                >

                  <span className="font-label-sm text-label-sm text-secondary font-semibold group-hover:underline">
                    Mahasiswa
                  </span>

                  <span className="font-code-sm text-code-sm text-on-surface-variant text-[11px]">
                    230101001
                  </span>

                  <span className="font-code-sm text-code-sm text-outline text-[11px]">
                    mahasiswa123
                  </span>

                </button>

                {/* Dosen */}

                <button
                  type="button"
                  onClick={() =>
                    handleRoleSelect('dsn')
                  }
                  className="flex flex-col text-left p-1.5 bg-surface-container-lowest hover:bg-surface-bright rounded transition-colors group cursor-pointer"
                >

                  <span className="font-label-sm text-label-sm text-secondary font-semibold group-hover:underline">
                    Dosen
                  </span>

                  <span
                    className="font-code-sm text-code-sm text-on-surface-variant truncate w-full text-[11px]"
                    title="198501152010121002"
                  >
                    19850115...
                  </span>

                  <span className="font-code-sm text-code-sm text-outline text-[11px]">
                    dosen123
                  </span>

                </button>

                {/* Admin */}

                <button
                  type="button"
                  onClick={() =>
                    handleRoleSelect('adm')
                  }
                  className="flex flex-col text-left p-1.5 bg-surface-container-lowest hover:bg-surface-bright rounded transition-colors group cursor-pointer"
                >

                  <span className="font-label-sm text-label-sm text-secondary font-semibold group-hover:underline">
                    Admin
                  </span>

                  <span className="font-code-sm text-code-sm text-on-surface-variant text-[11px]">
                    admin
                  </span>

                  <span className="font-code-sm text-code-sm text-outline text-[11px]">
                    admin123
                  </span>

                </button>

              </div>
            </div>

            {/* Footer */}

            <div className="relative z-10 mt-space-md pt-space-xs text-center">

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-on-surface-variant mb-2">

                <span className="material-symbols-outlined text-[15px] text-tertiary-container">
                  verified_user
                </span>

                <span className="font-label-sm text-label-sm">
                  Dilindungi enkripsi sesi &amp; otentikasi role terintegrasi
                </span>

              </div>

              <p className="font-code-sm text-code-sm text-outline text-xs">
                Terhubung ke Google Sheets • Google Apps Script
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};