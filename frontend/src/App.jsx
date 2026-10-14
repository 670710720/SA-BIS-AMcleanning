
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./page/Login"; //login
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Department from "./page/Department";
import NotFound from "./page/NotFound";
import Customers from "./page/Customers";
function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gray-950 text-white"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header เต็มความกว้าง อยู่บนสุด */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* พื้นที่ด้านล่าง Header */}
      <div>
        {/* Navbar อยู่ซ้ายใต้ Header */}
        <div className="fixed left-0 top-20 bottom-0 z-40 w-64">
          <Navbar darkMode={darkMode} />
        </div>

        {/* เนื้อหาหลักอยู่ขวา Navbar */}
        <main
          className={`ml-64 min-h-[calc(100vh-5rem)] p-8 transition-colors duration-300 ${
            darkMode ? "bg-gray-950" : "bg-gray-50"
          }`}
        >
          <Routes>
            <Route path="/login" element={<Login />} /> {/*login*/}
            <Route
              path="/"
              element={<h1 className="text-2xl font-bold">หน้าหลัก</h1>}
            />
            <Route
              path="/employee"
              element={<h1 className="text-2xl font-bold">จัดการพนักงาน</h1>}
            />
            <Route path="/department" element={<Department />} />
            <Route path="/customer" element={<Customers />} />
            <Route
              path="/payroll"
              element={<h1 className="text-2xl font-bold">เงินเดือนพนักงาน</h1>}
            />
          <Route path="*" element={<NotFound darkMode={darkMode} />} />
          </Routes>
          
        </main>
      </div>
    </div>
  );
}

export default App;
