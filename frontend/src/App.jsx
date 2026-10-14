import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Department from "./page/Department";
import NotFound from "./page/NotFound";
import Payroll from "./page/Payroll";

function App() {
  const [darkMode, setDarkMode] = useState(false);

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
      {/* Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div>
        {/* Navbar */}
        <div className="fixed bottom-0 left-0 top-20 z-40 w-64">
          <Navbar darkMode={darkMode} />
        </div>

        {/* Main Content */}
        <main
          className={`ml-64 min-h-[calc(100vh-5rem)] p-8 transition-colors duration-300 ${
            darkMode
              ? "bg-gray-950 text-white"
              : "bg-gray-50 text-gray-900"
          }`}
        >
          <Routes>
            {/* หน้าหลัก */}
            <Route
              path="/"
              element={
                <h1 className="text-2xl font-bold">
                  หน้าหลัก
                </h1>
              }
            />

            {/* จัดการพนักงาน */}
            <Route
              path="/employee"
              element={
                <h1 className="text-2xl font-bold">
                  จัดการพนักงาน
                </h1>
              }
            />

            {/* จัดการแผนก */}
            <Route
              path="/department"
              element={<Department />}
            />

            {/* ข้อมูลลูกค้า */}
            <Route
              path="/customer"
              element={
                <h1 className="text-2xl font-bold">
                  ข้อมูลลูกค้า
                </h1>
              }
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