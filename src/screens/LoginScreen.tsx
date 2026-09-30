import React, { useState } from "react";
import { UserRole, ScreenId } from "../types";
import { getData } from "../services/api";

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, user: any) => void;
  onNavigate: (screen: ScreenId) => void;
}

type LoginRole = "mhs" | "dsn" | "adm";

interface RoleMeta {
  label: string;
  placeholder: string;
  user: string;
  pass: string;
  actualRole: UserRole;
}

export function LoginScreen({
  onLoginSuccess,
  onNavigate,
}: LoginScreenProps) {
  const [role, setRole] = useState<LoginRole>("mhs");

  const [identity, setIdentity] =
    useState("230101001");

  const [password, setPassword] =
    useState("mahasiswa123");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const roleMeta: Record<LoginRole, RoleMeta> = {
    mhs: {
      label: "NIM",
      placeholder: "Contoh: 230101001",
      user: "230101001",
      pass: "mahasiswa123",
      actualRole: "student",
    },

    dsn: {
      label: "NIDN",
      placeholder: "Contoh: 12345678",
      user: "12345678",
      pass: "dosen123",
      actualRole: "lecturer",
    },

    adm: {
      label: "Username",
      placeholder: "Contoh: admin",
      user: "admin",
      pass: "admin123",
      actualRole: "admin",
    },
  };

  const handleRoleSelect = (
    selectedRole: LoginRole
  ) => {
    setRole(selectedRole);

    const selected =
      roleMeta[selectedRole];

    setIdentity(selected.user);
    setPassword(selected.pass);
  };

  const handleLogin = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!identity.trim() || !password.trim()) {
      alert(
        "NIM/NIDN/Username dan password harus diisi."
      );
      return;
    }

    setIsLoading(true);

    try {
      console.log(
        "Mencoba mengambil data users dari Google Sheets..."
      );

      const users = await getData("users");

      console.log(
        "Data users dari Google Sheets:",
        users
      );

      const user = users.find(
        (item: any) =>
          String(item.username)
            .trim()
            .toLowerCase() ===
            identity.trim().toLowerCase() &&
          String(item.password).trim() ===
            password.trim()
      );

      if (!user) {
        alert(
          "NIM/NIDN/Username atau password salah."
        );
        return;
      }

      console.log(
        "User yang berhasil login:",
        user
      );

      let actualRole: UserRole;

      if (
        user.role === "mahasiswa" ||
        user.role === "student"
      ) {
        actualRole = "student";
      } else if (
        user.role === "dosen" ||
        user.role === "lecturer"
      ) {
        actualRole = "lecturer";
      } else {
        actualRole = "admin";
      }

      onLoginSuccess(
        actualRole,
        user
      );

    } catch (error) {
      console.error(
        "Login gagal:",
        error
      );

      alert(
        "Gagal terhubung ke server. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const currentMeta =
    roleMeta[role];

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-on-primary mb-4">
            <span className="text-2xl font-bold">
              SP
            </span>
          </div>

          <h1 className="text-3xl font-bold text-on-surface">
            SmartPeople
          </h1>

          <p className="mt-2 text-on-surface-variant">
            Sistem Informasi Akademik
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-lg p-6 sm:p-8 border border-outline-variant">

          <h2 className="text-xl font-bold text-on-surface mb-2">
            Selamat Datang 👋
          </h2>

          <p className="text-sm text-on-surface-variant mb-6">
            Silakan masuk untuk melanjutkan
          </p>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-on-surface mb-2">
              Masuk sebagai
            </label>

            <div className="grid grid-cols-3 gap-2">

              <button
                type="button"
                onClick={() =>
                  handleRoleSelect("mhs")
                }
                className={`py-3 px-2 rounded-xl text-sm font-medium border transition ${
                  role === "mhs"
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface border-outline-variant hover:bg-surface-container"
                }`}
              >
                Mahasiswa
              </button>

              <button
                type="button"
                onClick={() =>
                  handleRoleSelect("dsn")
                }
                className={`py-3 px-2 rounded-xl text-sm font-medium border transition ${
                  role === "dsn"
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface border-outline-variant hover:bg-surface-container"
                }`}
              >
                Dosen
              </button>

              <button
                type="button"
                onClick={() =>
                  handleRoleSelect("adm")
                }
                className={`py-3 px-2 rounded-xl text-sm font-medium border transition ${
                  role === "adm"
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface border-outline-variant hover:bg-surface-container"
                }`}
              >
                Admin
              </button>

            </div>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Identity */}
            <div>
              <label
                htmlFor="identity"
                className="block text-sm font-medium text-on-surface mb-2"
              >
                {currentMeta.label}
              </label>

              <input
                id="identity"
                type="text"
                value={identity}
                onChange={(event) =>
                  setIdentity(
                    event.target.value
                  )
                }
                placeholder={
                  currentMeta.placeholder
                }
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-surface mb-2"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-outline-variant bg-surface text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword
                    ? "Sembunyikan"
                    : "Lihat"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-semibold transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Memproses..."
                : "Masuk"}
            </button>

          </form>

          {/* Demo Account Information */}
          <div className="mt-6 p-4 rounded-xl bg-surface-container text-sm">

            <p className="font-semibold text-on-surface mb-3">
              Akun Demo
            </p>

            <div className="space-y-3 text-on-surface-variant">

              <div>
                <p className="font-medium text-on-surface">
                  Mahasiswa
                </p>
                <p>
                  NIM: 230101001
                </p>
                <p>
                  Password: mahasiswa123
                </p>
              </div>

              <div>
                <p className="font-medium text-on-surface">
                  Dosen
                </p>
                <p>
                  NIDN: 12345678
                </p>
                <p>
                  Password: dosen123
                </p>
              </div>

              <div>
                <p className="font-medium text-on-surface">
                  Admin
                </p>
                <p>
                  Username: admin
                </p>
                <p>
                  Password: admin123
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-on-surface-variant mt-6">
          © 2026 SmartPeople
        </p>

      </div>
    </div>
  );
}