import { useEffect, useMemo, useState } from "react";

const API_URL = "/api";
const PAGE_SIZE = 8;
const DATA_START_MONTH = "2026-10";

const money = (value) =>
  Number(value ?? 0).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatMonth = (date = new Date()) =>
  new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
  }).format(date);

const getDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return "";
};

const normalizeStatus = (status) => {
  const value = String(status ?? "").trim();
  if (value === "มาปกติ" || value === "ปกติ") return "ปกติ";
  if (["ขาดงาน", "ลาป่วย", "ลากิจ", "มาสาย"].includes(value)) {
    return value;
  }
  return "ไม่ระบุสถานะ";
};

// อ่านเลขบัญชีจากชื่อฟิลด์ที่ API อาจส่งกลับมา
const getBankAccount = (employee) => {
  const value =
    employee.bank_account ??
    employee.bankAccount ??
    employee.BankAccount;

  if (value === null || value === undefined || String(value).trim() === "") {
    return "-";
  }

  return String(value);
};

async function apiRequest(path) {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`โหลดข้อมูล ${path} ไม่สำเร็จ (${response.status})`);
  }
  return response.json();
}

async function loadPayrollData() {
  const [employeeData, departmentData, payrollData, attendanceData] =
    await Promise.all([
      apiRequest("/employees"),
      apiRequest("/departments"),
      apiRequest("/payroll"),
      apiRequest("/attendance"),
    ]);

  if (
    !Array.isArray(employeeData) ||
    !Array.isArray(departmentData) ||
    !Array.isArray(payrollData) ||
    !Array.isArray(attendanceData)
  ) {
    throw new Error("รูปแบบข้อมูล API ไม่ถูกต้อง กรุณาตรวจสอบ Backend");
  }

  const departmentsById = new Map(
    departmentData.map((item) => [
      String(item.department_id),
      item.department_name,
    ])
  );

  const payrollByEmployeeId = new Map(
    payrollData.map((item) => [String(item.employee_id), item])
  );

  const employees = employeeData.map((employee) => {
    const id = String(employee.employee_id);
    const payroll = payrollByEmployeeId.get(id);

    return {
      id,
      employee_code: id,
      full_name: [
        employee.employee_firstname,
        employee.employee_lastname,
      ]
        .filter(Boolean)
        .join(" "),
      bank_account: getBankAccount(employee),
      department:
        departmentsById.get(String(employee.department_id)) ?? "-",
      salary: Number(payroll?.salary ?? 0),
      bonus: Number(payroll?.bonus ?? 0),
    };
  });

  const attendances = attendanceData.map((item) => ({
    date: getDateKey(item.attendance_date),
    employeeId: String(item.employee_id),
    status: normalizeStatus(item.status),
    reason: item.reason ?? "",
  }));

  return { employees, attendances };
}

/* SVG Icons */
function Icon({ name, size = 20, className = "" }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
        <path d="m9 16 2 2 4-4" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="5" width="14" height="16" rx="2" />
        <path d="M9 5V3h6v2M9 12h6M9 16h4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    building: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="1" />
        <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
      </>
    ),
    alert: (
      <>
        <path d="m12 3 10 18H2L12 3Z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...common}
      aria-hidden="true"
    >
      {paths[name] ?? paths.clipboard}
    </svg>
  );
}

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("ทั้งหมด");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
  });

  const monthOptions = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - index,
        1
      );

      return {
        value: `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`,
        label: formatMonth(date),
      };
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const data = await loadPayrollData();

        if (active) {
          setEmployees(data.employees);
          setAttendance(data.attendances);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "โหลดข้อมูลไม่สำเร็จ");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;

    const handleKey = (event) => {
      if (event.key === "Escape") {
        setSelectedEmployee(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedEmployee]);

  // เริ่มแสดงข้อมูลการทำงานตั้งแต่เดือนตุลาคม 2026
  const hasMonthlyData = month >= DATA_START_MONTH;

  const monthlyAttendance = useMemo(
    () =>
      hasMonthlyData
        ? attendance.filter((item) => item.date.startsWith(month))
        : [],
    [attendance, month, hasMonthlyData]
  );

  const getRecords = (employeeId) =>
    monthlyAttendance.filter(
      (item) => item.employeeId === String(employeeId)
    );

  const getCount = (employeeId, type) =>
    getRecords(employeeId).filter((item) => item.status === type).length;

  const summary = useMemo(() => {
    const count = (type) =>
      monthlyAttendance.filter((item) => item.status === type).length;

    return {
      employees: employees.length,
      absent: count("ขาดงาน"),
      leave: count("ลาป่วย") + count("ลากิจ"),
      late: count("มาสาย"),
    };
  }, [employees.length, monthlyAttendance]);

  const departments = [
    "ทั้งหมด",
    ...new Set(
      employees
        .map((item) => item.department)
        .filter((item) => item && item !== "-")
    ),
  ];

  const filteredEmployees = employees.filter((employee) => {
    const keyword = search.trim().toLowerCase();

    const matchesSearch =
      employee.employee_code.toLowerCase().includes(keyword) ||
      employee.full_name.toLowerCase().includes(keyword);

    const matchesDepartment =
      department === "ทั้งหมด" || employee.department === department;

    return matchesSearch && matchesDepartment;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleEmployees = filteredEmployees.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search, department, month]);

  const statCards = [
    {
      title: "พนักงานทั้งหมด",
      value: summary.employees,
      unit: "คน",
      icon: "users",
      color: "blue",
      note: "จำนวนพนักงานในระบบ",
    },
    {
      title: "ขาดงาน",
      value: hasMonthlyData ? summary.absent : null,
      unit: "รายการ",
      icon: "calendar",
      color: "red",
      note: "ประจำเดือนที่เลือก",
    },
    {
      title: "การลา",
      value: hasMonthlyData ? summary.leave : null,
      unit: "รายการ",
      icon: "clipboard",
      color: "violet",
      note: "ลาป่วยและลากิจ",
    },
    {
      title: "มาสาย",
      value: hasMonthlyData ? summary.late : null,
      unit: "รายการ",
      icon: "clock",
      color: "amber",
      note: "ประจำเดือนที่เลือก",
    },
  ];

  const statColors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
    red: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-300",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <main className="min-w-0 px-5 py-8 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-[1500px] space-y-7">
          {/* Page heading */}
          <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                เงินเดือนพนักงาน
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                จัดการข้อมูลเงินเดือน โบนัส และตรวจสอบสถิติการทำงาน
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                รอบเดือนที่เลือก
              </p>
              <p className="mt-1 font-semibold">
                {formatMonth(new Date(`${month}-01T12:00:00`))}
              </p>
            </div>
          </header>

          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {card.title}
                    </p>

                    <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {card.value === null
                        ? "ไม่มีข้อมูล"
                        : card.value.toLocaleString("th-TH")}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {card.value === null
                        ? "เริ่มเก็บข้อมูลเดือนตุลาคม 2026"
                        : card.unit}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${statColors[card.color]}`}
                  >
                    <Icon name={card.icon} size={24} />
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  {card.note}
                </div>
              </div>
            ))}
          </section>

          {/* Search and filters */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Icon
                name="clipboard"
                size={18}
                className="text-slate-500 dark:text-slate-400"
              />
              <h2 className="font-semibold">ค้นหาและกรองข้อมูล</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,1fr)_190px_180px_auto] xl:items-end">
              <div>
                <label
                  htmlFor="payroll-search"
                  className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  ค้นหาพนักงาน
                </label>

                <div className="relative">
                  <Icon
                    name="search"
                    size={19}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="payroll-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="รหัสพนักงาน หรือชื่อ-นามสกุล"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="payroll-month"
                  className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  เดือน
                </label>

                <select
                  id="payroll-month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {monthOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="payroll-department"
                  className="mb-2 block text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  แผนก
                </label>

                <select
                  id="payroll-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item === "ทั้งหมด" ? "ทุกแผนก" : item}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDepartment("ทั้งหมด");
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </section>

          {/* Employee table */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold">รายชื่อพนักงาน</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  เลือกดูรายละเอียดเงินเดือนและสถิติการทำงานของพนักงาน
                </p>
              </div>

              <span className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {filteredEmployees.length.toLocaleString("th-TH")} รายการ
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                <p className="mt-4 text-sm text-slate-500">
                  กำลังโหลดข้อมูลพนักงาน...
                </p>
              </div>
            ) : error ? (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300">
                  <Icon name="alert" size={24} />
                </div>

                <p className="mt-3 font-semibold text-red-600 dark:text-red-300">
                  โหลดข้อมูลไม่สำเร็จ
                </p>

                <p className="mt-1 text-sm text-slate-500">{error}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  โหลดหน้าใหม่
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      <tr>
                        <th className="px-6 py-4 font-semibold">
                          พนักงาน
                        </th>
                        <th className="px-6 py-4 font-semibold">แผนก</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          เงินเดือน
                        </th>
                        <th className="px-6 py-4 text-right font-semibold">
                          โบนัส
                        </th>
                        <th className="px-6 py-4 text-right font-semibold">
                          รายละเอียด
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {visibleEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                        >
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => setSelectedEmployee(employee)}
                              className="flex items-center gap-3 text-left"
                            >
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                {employee.full_name
                                  .split(/\s+/)
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((part) => part.charAt(0))
                                  .join("") || "?"}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">
                                  {employee.full_name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  รหัส {employee.employee_code}
                                </p>
                              </div>
                            </button>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Icon
                                name="building"
                                size={16}
                                className="text-slate-400"
                              />
                              {employee.department}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums">
                            ฿{money(employee.salary)}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-slate-600 dark:text-slate-300">
                            ฿{money(employee.bonus)}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedEmployee(employee)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                            >
                              ดูรายละเอียด
                              <Icon name="chevronRight" size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {visibleEmployees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-16 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                              <Icon name="search" size={26} />
                            </div>

                            <p className="mt-4 font-semibold">
                              ไม่พบข้อมูลพนักงาน
                            </p>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              ลองเปลี่ยนคำค้นหา หรือเลือกแผนกใหม่
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col justify-between gap-4 border-t border-slate-200 px-6 py-4 text-sm dark:border-slate-800 sm:flex-row sm:items-center">
                  <span className="text-slate-500 dark:text-slate-400">
                    แสดง{" "}
                    {filteredEmployees.length === 0
                      ? 0
                      : (currentPage - 1) * PAGE_SIZE + 1}
                    {" - "}
                    {Math.min(
                      currentPage * PAGE_SIZE,
                      filteredEmployees.length
                    )}
                    {" จาก "}
                    {filteredEmployees.length} รายการ
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setPage((p) => Math.max(1, p - 1))
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
                      aria-label="หน้าก่อนหน้า"
                    >
                      <Icon name="chevronLeft" size={18} />
                    </button>

                    <span className="min-w-9 rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white">
                      {currentPage}
                    </span>

                    <span className="px-1 text-slate-500">
                      / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800"
                      aria-label="หน้าถัดไป"
                    >
                      <Icon name="chevronRight" size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Employee detail modal */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedEmployee(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payroll-modal-title"
            className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2
                  id="payroll-modal-title"
                  className="mt-2 text-2xl font-bold"
                >
                  รายละเอียดเงินเดือน
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {formatMonth(new Date(`${month}-01T12:00:00`))}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                aria-label="ปิด"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {selectedEmployee.full_name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part.charAt(0))
                    .join("") || "?"}
                </div>

                <div>
                  <h3 className="text-xl font-bold">
                    {selectedEmployee.full_name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    รหัส {selectedEmployee.employee_code} ·{" "}
                    {selectedEmployee.department}
                  </p>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    เลขบัญชีธนาคาร:{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {String(
                        selectedEmployee.bank_account ??
                          selectedEmployee.bankAccount ??
                          selectedEmployee.BankAccount ??
                          "-"
                      )}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40 sm:p-6">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  เงินเดือนพื้นฐาน
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-200 sm:text-4xl">
                  ฿{money(selectedEmployee.salary)}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-blue-200 pt-4 dark:border-blue-800">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      โบนัส
                    </p>

                    <p className="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">
                      ฿{money(selectedEmployee.bonus)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      เงินเดือนสุทธิ (รวมโบนัส)
                    </p>

                    <p className="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">
                      ฿
                      {money(
                        Number(selectedEmployee.salary) +
                          Number(selectedEmployee.bonus)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <section className="mt-7">
                <h3 className="font-bold">สถิติการทำงานรายเดือน</h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {formatMonth(new Date(`${month}-01T12:00:00`))}
                </p>

                {!hasMonthlyData && (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    ไม่มีข้อมูลย้อนหลัง เนื่องจากระบบเริ่มเก็บข้อมูลในเดือนตุลาคม 2026
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      type: "ขาดงาน",
                      value: getCount(selectedEmployee.id, "ขาดงาน"),
                      color:
                        "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
                      icon: "calendar",
                    },
                    {
                      type: "ลาป่วย",
                      value: getCount(selectedEmployee.id, "ลาป่วย"),
                      color:
                        "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
                      icon: "clipboard",
                    },
                    {
                      type: "ลากิจ",
                      value: getCount(selectedEmployee.id, "ลากิจ"),
                      color:
                        "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
                      icon: "users",
                    },
                    {
                      type: "มาสาย",
                      value: getCount(selectedEmployee.id, "มาสาย"),
                      color:
                        "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
                      icon: "clock",
                    },
                  ].map((item) => (
                    <div
                      key={item.type}
                      className={`rounded-xl p-4 ${item.color}`}
                    >
                      <Icon name={item.icon} size={21} />

                      <p className="mt-3 text-sm font-medium">
                        {item.type}
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        {hasMonthlyData ? item.value : "ไม่มีข้อมูล"}
                      </p>

                      <p className="text-xs opacity-75">
                        {hasMonthlyData ? "รายการ" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-7 flex justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  ปิดรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}