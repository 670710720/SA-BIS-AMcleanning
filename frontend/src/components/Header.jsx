import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Moon,
  Sun,
  CircleUserRound,
  LogOut,
} from "lucide-react";

export default function Header({ darkMode, setDarkMode }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b px-6 transition-colors duration-300 ${
        darkMode
          ? "border-gray-700 bg-gray-900 text-white"
          : "border-gray-200 bg-am-blue text-gray-900"
      }`}
    >
      {/* Logo + Company Name */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src="/AMlogo.jpg"
          alt="AM Cleaning Logo"
          className="h-12 w-12 rounded-lg object-contain"
        />

        <span className="text-lg font-bold">
          AM Professional Cleaning Service
        </span>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDarkMode((prev) => !prev)}
          title={darkMode ? "โหมดกลางวัน" : "โหมดกลางคืน"}
          aria-label={darkMode ? "เปลี่ยนเป็นโหมดกลางวัน" : "เปลี่ยนเป็นโหมดกลางคืน"}
          className={`rounded-full p-2 transition-colors ${
            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          {darkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        <button
          type="button"
          onClick={() => setShowProfile((prev) => !prev)}
          title="ดูโปรไฟล์"
          aria-expanded={showProfile}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
            darkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <CircleUserRound size={25} />
        </button>
      </div>

      {/* Profile Dropdown */}
      {showProfile && (
        <div
          className={`absolute right-3 top-full w-64 overflow-hidden rounded-lg border shadow-lg ${
            darkMode
              ? "border-gray-700 bg-gray-800 text-white"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <div className="flex items-center gap-3 p-4">
            <CircleUserRound size={40} />
            <div>
              <p className="font-medium">กมลชนก ศรีสุข</p>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                พนักงาน
              </p>
            </div>
          </div>

          <div
            className={`px-4 pb-4 text-xs leading-6 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            <p>รหัสพนักงาน : 10001</p>
            <p>แผนก : ฝ่ายบุคคล</p>
          </div>

          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm(
                "คุณต้องการออกจากระบบหรือไม่?"
              );

              if (confirmed) {
                alert("ระบบ Logout ยังไม่ได้เชื่อมต่อ");
              }
            }}
            className={`flex w-full items-center gap-3 border-t px-4 py-3 text-left text-sm transition-colors ${
              darkMode
                ? "border-gray-700 hover:bg-gray-700"
                : "border-gray-200 hover:bg-gray-100"
            }`}
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      )}
    </header>
  );
}
