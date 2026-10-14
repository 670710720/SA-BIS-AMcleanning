import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();

    // สำหรับทดสอบการเปลี่ยนหน้าเท่านั้น
    localStorage.setItem("isLoggedIn", "true");

    navigate("/");
  };
  return (
    <div className="min-h-screen bg-sky-50 text-slate-700">
      <div className="grid min-h-screen grid-cols-2">




        {/* Left: Branding */}
        <section className="relative flex min-h-screen flex-col justify-center
  overflow-hidden bg-gradient-to-br from-sky-200 via-sky-300 to-blue-300
  px-8 py-12 sm:px-12 lg:px-16">

          {/* Decorative background */}
          <div className="absolute -left-28 -top-28 h-80 w-80
    rounded-full bg-white/20" />

          <div className="absolute -bottom-20 -left-20 h-72 w-72
    rounded-full bg-sky-400/25" />

          <div className="absolute right-12 top-24 h-16 w-16
    rounded-full bg-white/20" />

          <div className="absolute right-28 top-48 h-6 w-6
    rounded-full bg-white/30" />

          {/* Main content */}
          <div className="relative z-10 mx-auto w-full max-w-xl">

            {/* Brand label */}
            <div className="mb-8 inline-flex w-fit items-center gap-2
      rounded-full border border-white/50 bg-white/30
      px-4 py-2 text-sm font-semibold text-sky-950
      shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-sky-600" />
              CLEANING MANAGEMENT SYSTEM
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-tight
      tracking-tight text-sky-950 sm:text-5xl xl:text-6xl">
              AM Professional
              <span className="mt-1 block">Cleaning Service</span>
            </h1>

            <div className="my-7 h-1.5 w-20 rounded-full
      bg-gradient-to-r from-sky-600 to-white" />

            <h2 className="text-xl font-bold text-slate-700 sm:text-2xl">
              สำหรับผู้ดูแลระบบ
            </h2>

            {/* Illustration card */}
            <div className="mt-12 flex justify-end">
              <div className="relative flex h-40 w-40 items-center
        justify-center rounded-[2rem] border border-white/60
        bg-white/35 text-sky-800 shadow-xl shadow-sky-700/10
        backdrop-blur-md sm:h-48 sm:w-48">

                {/* Spray bottle icon */}
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-24 w-24 sm:h-28 sm:w-28"
                  aria-hidden="true"
                >
                  <path d="M38 26h28l8 8H53l-5 8" />
                  <path d="M38 26v-8h20v8" />
                  <path d="M38 34h25l5 13v37a7 7 0 0 1-7 7H38a7 7 0 0 1-7-7V48a7 7 0 0 1 7-7" />
                  <path d="M43 58c7-5 13 5 20 0" />
                  <path d="M15 30l8 4M12 42h10M18 53l7-4" />
                  <path d="M76 58l3-5 3 5 5 3-5 3-3 5-3-5-5-3z" />
                  <path d="M28 73l2-3 2 3 3 2-3 2-2 3-2-3-3-2z" />
                </svg>

                {/* Sparkle */}
                <div className="absolute -right-3 top-5 h-7 w-7
          rotate-12 rounded-lg bg-white/70" />
                <div className="absolute -bottom-3 -left-3 h-8 w-8
          rounded-full bg-sky-100 shadow-md" />
              </div>
            </div>
          </div>

          {/* Bottom wave decoration */}
          <svg
            className="absolute bottom-0 left-0 w-full opacity-30"
            viewBox="0 0 600 100"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 55C120 0 180 100 310 55S480 0 600 45V100H0Z"
              fill="white"
            />
          </svg>
          {/* Bottom caption */}
          {/* Bottom caption */}
        </section>



        {/* Right: Login Form */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-white to-blue-100 px-5 py-10 sm:px-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-200/60 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="relative z-10 w-full max-w-xl">
            <div className="rounded-3xl border border-white/80 bg-white/90 p-7 shadow-2xl shadow-sky-200/50 backdrop-blur-xl sm:p-10 md:p-12">


              <div className="mb-9 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-sky-100 text-3xl">
                  <svg
                    className="h-10 w-10 text-sky-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                  </svg>
                </div>

                <h2 className="text-3xl font-extrabold text-sky-950 sm:text-4xl">
                  เข้าสู่ระบบ
                </h2>
                <p className="mt-3 text-sm text-slate-500 sm:text-base">
                  กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Employee Code */}
                <div>
                  <label
                    htmlFor="employeeCode"
                    className="mb-3 block font-bold text-sky-950"
                  >
                    รหัสพนักงาน
                  </label>

                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                    <svg
                      className="h-6 w-6 shrink-0 text-sky-800"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
                    </svg>

                    <input
                      id="employeeCode"
                      type="text"
                      autoComplete="username"
                      placeholder="กรอกรหัสพนักงาน"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      required
                      className="w-full bg-transparent px-4 py-5 text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-3 block font-bold text-sky-950"
                  >
                    รหัสผ่าน
                  </label>

                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 transition focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100">
                    <svg
                      className="h-6 w-6 shrink-0 text-sky-800"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
                      <circle cx="12" cy="15" r="1" />
                    </svg>

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-transparent px-4 py-5 text-slate-700 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5 0 9 5 9 7a9 9 0 0 1-3 3.5M6.2 6.2C4.2 7.5 3 10 3 12c0 2 4 7 9 7 1 0 2-.2 2.9-.6" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <a
                      href="/forgot-password"
                      className="text-sm font-semibold text-sky-600 transition hover:text-sky-800 hover:underline"
                    >
                      ลืมรหัสผ่าน?
                    </a>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-5 text-lg font-bold text-white shadow-lg shadow-sky-200 transition duration-300 hover:-translate-y-0.5 hover:from-sky-600 hover:to-blue-700 hover:shadow-xl active:translate-y-0"
                >
                  เข้าสู่ระบบ
                  <svg
                    className="h-5 w-5 transition group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </form>
            </div>

            <footer className="mt-8 text-center text-xs text-slate-400 sm:text-sm">
              © 2026 CleanCare | Cleaning Service Management System
            </footer>
          </div>
        </section>
      </div>
    </div>

  );
}