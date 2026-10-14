
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Department from "./page/Department";
import NotFound from "./page/NotFound";
import Payroll from "./page/Payroll";
import Employees from "./page/Employees";
import Customers from "./page/Customers";
import Login from "./page/Login";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  // ตรวจสอบว่าเป็นหน้า Login หรือไม่
  const isLoginPage = location.pathname === "/";

  // เปิดใช้งาน Dark Mode ให้ Tailwind ทั้งเว็บไซต์
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gray-950 text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header: ซ่อนในหน้า Login */}
      {!isLoginPage && (
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      <div>
        {/* Navbar: ซ่อนในหน้า Login */}
        {!isLoginPage && (
          <div className="fixed bottom-0 left-0 top-20 z-40 w-64">
            <Navbar darkMode={darkMode} />
          </div>
        )}

        {/* Main Content */}
        <main
          className={`min-h-[calc(100vh-5rem)] p-8 transition-colors duration-300 ${
            isLoginPage ? "ml-0" : "ml-64"
          } ${
            darkMode
              ? "bg-gray-950 text-white"
              : "bg-gray-50 text-gray-900"
          }`}
        >
          <Routes>
            {/* หน้าหลัก / Login */}
            <Route
              path="/"
              element={<Login />}
            />

            {/* จัดการพนักงาน */}
            <Route
              path="/employee"
              element={<Employees />}
            />

            {/* จัดการแผนก */}
            <Route
              path="/department"
              element={<Department />}
            />

            {/* ข้อมูลลูกค้า */}
            <Route
              path="/customer"
              element={<Customers />}
            />

            {/* Payroll */}
            <Route
              path="/payroll"
              element={<Payroll />}
            />

            {/* ไม่พบหน้า */}
            <Route
              path="*"
              element={<NotFound darkMode={darkMode} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;