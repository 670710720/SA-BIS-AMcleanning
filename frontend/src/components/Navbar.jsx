
import { NavLink } from "react-router-dom";
import {
  House,
  Users,
  Briefcase,
  UserCheck,
  Coins,
} from "lucide-react";

const navItems = [
  { path: "/", label: "หน้าหลัก", icon: House },
  { path: "/employee", label: "จัดการพนักงาน", icon: Users },
  { path: "/department", label: "จัดการตำแหน่ง", icon: Briefcase },
  { path: "/customer", label: "ข้อมูลลูกค้า", icon: UserCheck },
  { path: "/payroll", label: "เงินเดือนพนักงาน", icon: Coins },
];

export default function Navbar({ darkMode }) {
  return (
    <aside
      className={`flex h-full w-full flex-col border-r transition-colors duration-300 ${
        darkMode
          ? "border-gray-700 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-900"
      }`}
    >
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? darkMode
                    ? "bg-blue-900 text-blue-200"
                    : "bg-blue-50 text-blue-700"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                    : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
