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

const getDateKey = (value) =>
  value ? String(value).slice(0, 10) : "";

const normalizeStatus = (status) => {
  const value = String(status ?? "").trim();
  if (value === "มาปกติ" || value === "ปกติ") return "ปกติ";
  if (["ขาดงาน", "ลาป่วย", "ลากิจ", "มาสาย"].includes(value)) {
    return value;
  }
  return "ไม่ระบุสถานะ";
};

const getBankAccount = (employee) => {
  const value =
    employee.bank_account ??
    employee.bankAccount ??
    employee.BankAccount;

  return value == null || String(value).trim() === ""
    ? "-"
    : String(value);
};

async function apiRequest(path) {
  const response = await fetch(`${API_URL}${path}`);
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error || `โหลดข้อมูล ${path} ไม่สำเร็จ (${response.status})`
    );
  }

  return result;
}

async function updateAPI(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error || `บันทึกข้อมูลไม่สำเร็จ (${response.status})`
    );
  }

  return result;
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
    throw new Error("รูปแบบข้อมูล API ไม่ถูกต้อง");
  }

  const getField = (obj, ...keys) => {
    for (const key of keys) {
      if (obj?.[key] !== undefined && obj?.[key] !== null) {
        return obj[key];
      }
    }
    return null;
  };

  const normalizeId = (value) => {
    if (value === null || value === undefined || String(value).trim() === "") {
      return "";
    }

    return String(value).trim();
  };

  const departmentsById = new Map(
    departmentData.map((item) => [
      normalizeId(getField(item, "department_id", "DepartmentID")),
      getField(item, "department_name", "DepartmentName") ?? "-",
    ])
  );

  const payrollByEmployeeId = new Map();

  payrollData.forEach((item) => {
    const employeeId = getField(item, "employee_id", "EmployeeID");
    const payrollId = getField(item, "payroll_id", "PayrollID");

    if (employeeId !== null && payrollId !== null) {
      payrollByEmployeeId.set(normalizeId(employeeId), {
        payroll_id: payrollId,
        salary: getField(item, "salary", "Salary") ?? 0,
        bonus: getField(item, "bonus", "Bonus") ?? 0,
      });
    }
  });

  console.log("ข้อมูล API /payroll:", payrollData);
  console.log("ข้อมูล API /employees:", employeeData);
  console.log(
    "รหัสเงินเดือนที่จับคู่ได้:",
    Array.from(payrollByEmployeeId.entries())
  );

  const employees = employeeData.map((employee) => {
    const employeeId = getField(employee, "employee_id", "EmployeeID");
    const payroll = payrollByEmployeeId.get(normalizeId(employeeId));

    return {
      id: normalizeId(employeeId),
      employee_id: employeeId,
      payroll_id: payroll?.payroll_id ?? null,
      employee_code: normalizeId(employeeId) || "-",
      full_name: [
        getField(employee, "employee_firstname", "EmployeeFirstname"),
        getField(employee, "employee_lastname", "EmployeeLastname"),
      ]
        .filter(Boolean)
        .join(" "),
      bank_account:
        getField(employee, "bank_account", "BankAccount") ?? "-",
      department:
        departmentsById.get(
          normalizeId(getField(employee, "department_id", "DepartmentID"))
        ) ?? "-",
      salary: Number(payroll?.salary ?? 0),
      bonus: Number(payroll?.bonus ?? 0),
    };
  });

  const attendances = attendanceData.map((item) => ({
    date: getDateKey(
      getField(item, "attendance_date", "AttendanceDate")
    ),
    employeeId: normalizeId(
      getField(item, "employee_id", "EmployeeID")
    ),
    status: normalizeStatus(getField(item, "status", "Status")),
    reason: getField(item, "reason", "Reason") ?? "",
  }));

  return { employees, attendances };
}



function Icon({ name, size = 20 }) {
  const paths = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
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
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
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
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    salary: "",
    bonus: "",
    bank_account: "",
  });

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await loadPayrollData();
      setEmployees(data.employees);
      setAttendance(data.attendances);
    } catch (err) {
      setError(err.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedEmployee) return;

    const handleKey = (event) => {
      if (event.key === "Escape" && !saving) {
        setSelectedEmployee(null);
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedEmployee, saving]);

  const openEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setEditForm({
      salary: String(employee.salary ?? 0),
      bonus: String(employee.bonus ?? 0),
      bank_account:
        employee.bank_account === "-"
          ? ""
          : String(employee.bank_account ?? ""),
    });
    setIsEditing(false);
  };


const handleSaveDetails = async () => {
  if (!selectedEmployee || saving) return;

  const employeeId = Number(selectedEmployee.employee_id);
  const payrollId = Number(selectedEmployee.payroll_id);

  const salaryText = String(editForm.salary).trim();
  const bonusText = String(editForm.bonus).trim();

  const salary = Number(salaryText);
  const bonus = Number(bonusText);

  if (
    salaryText === "" ||
    bonusText === "" ||
    !Number.isFinite(salary) ||
    !Number.isFinite(bonus) ||
    salary < 0 ||
    bonus < 0
  ) {
    window.alert("กรุณากรอกเงินเดือนและโบนัสเป็นตัวเลขตั้งแต่ 0 ขึ้นไป");
    return;
  }

  if (!Number.isSafeInteger(employeeId) || employeeId < 1) {
    window.alert("ไม่พบ employee_id กรุณาตรวจสอบข้อมูล API /employees");
    return;
  }

  if (!Number.isSafeInteger(payrollId) || payrollId < 1) {
    window.alert(
      "ไม่พบ payroll_id ของพนักงานคนนี้ กรุณาตรวจสอบข้อมูล API /payroll ว่ามี payroll_id และ employee_id หรือไม่"
    );
    return;
  }

  setSaving(true);

  try {
    // ใช้ payroll_id เป็นรหัสอ้างอิงสำหรับแก้เงินเดือนและโบนัส
    await updateAPI(`/payroll/${payrollId}`, {
      salary,
      bonus,
    });

    // ใช้ employee_id เป็นรหัสอ้างอิงสำหรับแก้เลขบัญชีธนาคาร
    await updateAPI(`/employees/${employeeId}`, {
      bank_account: editForm.bank_account.trim(),
    });

    const updatedEmployee = {
      ...selectedEmployee,
      salary,
      bonus,
      bank_account: editForm.bank_account.trim() || "-",
    };

    setEmployees((previous) =>
      previous.map((employee) =>
        employee.id === updatedEmployee.id
          ? updatedEmployee
          : employee
      )
    );

    setSelectedEmployee(updatedEmployee);
    setIsEditing(false);

    window.alert("บันทึกข้อมูลลงฐานข้อมูลสำเร็จ");
  } catch (err) {
    window.alert(`บันทึกข้อมูลไม่สำเร็จ: ${err.message}`);
  } finally {
    setSaving(false);
  }
};


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
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <main className="min-w-0 px-5 py-8 sm:px-7 lg:px-10">
        <div className="mx-auto max-w-[1500px] space-y-7">
          <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
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
                    <p className="mt-3 text-3xl font-bold">
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

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <Icon name="clipboard" size={18} />
              <h2 className="font-semibold">ค้นหาและกรองข้อมูล</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(240px,1fr)_190px_180px_auto] xl:items-end">
              <div>
                <label htmlFor="payroll-search" className="mb-2 block text-xs font-medium">
                  ค้นหาพนักงาน
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="search" size={19} />
                  </span>
                  <input
                    id="payroll-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="รหัสพนักงาน หรือชื่อ-นามสกุล"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="payroll-month" className="mb-2 block text-xs font-medium">
                  เดือน
                </label>
                <select
                  id="payroll-month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  {monthOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="payroll-department" className="mb-2 block text-xs font-medium">
                  แผนก
                </label>
                <select
                  id="payroll-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
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
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold">รายชื่อพนักงาน</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  เลือกดูรายละเอียดเงินเดือนและสถิติการทำงานของพนักงาน
                </p>
              </div>
              <span className="w-fit rounded-lg bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
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
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Icon name="alert" size={24} />
                </div>
                <p className="mt-3 font-semibold text-red-600">
                  โหลดข้อมูลไม่สำเร็จ
                </p>
                <p className="mt-1 text-sm text-slate-500">{error}</p>
                <button
                  type="button"
                  onClick={fetchData}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  ลองโหลดอีกครั้ง
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950">
                      <tr>
                        <th className="px-6 py-4 font-semibold">พนักงาน</th>
                        <th className="px-6 py-4 font-semibold">แผนก</th>
                        <th className="px-6 py-4 text-right font-semibold">เงินเดือน</th>
                        <th className="px-6 py-4 text-right font-semibold">โบนัส</th>
                        <th className="px-6 py-4 text-right font-semibold">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {visibleEmployees.map((employee) => (
                        <tr key={employee.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => openEmployeeDetails(employee)}
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
                                <p className="font-semibold">{employee.full_name}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  รหัส {employee.employee_code}
                                </p>
                              </div>
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2">
                              <Icon name="building" size={16} />
                              {employee.department}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right font-semibold">
                            ฿{money(employee.salary)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            ฿{money(employee.bonus)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => openEmployeeDetails(employee)}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:hover:bg-blue-950"
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
                            <Icon name="search" size={26} />
                            <p className="mt-4 font-semibold">ไม่พบข้อมูลพนักงาน</p>
                            <p className="mt-1 text-sm text-slate-500">
                              ลองเปลี่ยนคำค้นหา หรือเลือกแผนกใหม่
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col justify-between gap-4 border-t border-slate-200 px-6 py-4 text-sm dark:border-slate-800 sm:flex-row sm:items-center">
                  <span className="text-slate-500">
                    แสดง{" "}
                    {filteredEmployees.length === 0
                      ? 0
                      : (currentPage - 1) * PAGE_SIZE + 1}
                    {" - "}
                    {Math.min(currentPage * PAGE_SIZE, filteredEmployees.length)}
                    {" จาก "}
                    {filteredEmployees.length} รายการ
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30 dark:border-slate-700"
                      aria-label="หน้าก่อนหน้า"
                    >
                      <Icon name="chevronLeft" size={18} />
                    </button>
                    <span className="min-w-9 rounded-lg bg-blue-600 px-3 py-2 text-center font-semibold text-white">
                      {currentPage}
                    </span>
                    <span className="px-1 text-slate-500">/ {totalPages}</span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-30 dark:border-slate-700"
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

      {selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !saving) {
              setSelectedEmployee(null);
              setIsEditing(false);
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
                <h2 id="payroll-modal-title" className="text-2xl font-bold">
                  รายละเอียดเงินเดือน
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {formatMonth(new Date(`${month}-01T12:00:00`))}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  รหัสเงินเดือน: {selectedEmployee.payroll_id ?? "ไม่พบรหัส"}
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setSelectedEmployee(null);
                  setIsEditing(false);
                }}
                aria-label="ปิด"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
              >
                ✕
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
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold">{selectedEmployee.full_name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    รหัส {selectedEmployee.employee_code} · {selectedEmployee.department}
                  </p>

                  <label htmlFor="payroll-bank-account" className="mt-3 block text-sm font-medium">
                    เลขบัญชีธนาคาร
                  </label>
                  {isEditing ? (
                    <input
                      id="payroll-bank-account"
                      type="text"
                      value={editForm.bank_account}
                      onChange={(e) =>
                        setEditForm((previous) => ({
                          ...previous,
                          bank_account: e.target.value,
                        }))
                      }
                      placeholder="กรอกเลขบัญชีธนาคาร"
                      disabled={saving}
                      className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    />
                  ) : (
                    <p className="mt-1 break-all font-semibold">
                      {selectedEmployee.bank_account || "-"}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40 sm:p-6">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  เงินเดือนพื้นฐาน
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.salary}
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        salary: e.target.value,
                      }))
                    }
                    disabled={saving}
                    aria-label="เงินเดือนพื้นฐาน"
                    className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-2xl font-bold text-blue-700 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-200"
                  />
                ) : (
                  <p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-200 sm:text-4xl">
                    ฿{money(selectedEmployee.salary)}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-blue-200 pt-4 dark:border-blue-800">
                  <div>
                    <label htmlFor="payroll-bonus" className="text-sm text-blue-700 dark:text-blue-300">
                      โบนัส
                    </label>
                    {isEditing ? (
                      <input
                        id="payroll-bonus"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editForm.bonus}
                        onChange={(e) =>
                          setEditForm((previous) => ({
                            ...previous,
                            bonus: e.target.value,
                          }))
                        }
                        disabled={saving}
                        className="mt-1 w-full rounded-lg border border-blue-200 bg-white px-2 py-2 text-lg font-bold dark:border-blue-800 dark:bg-slate-900"
                      />
                    ) : (
                      <p className="mt-1 text-lg font-bold">
                        ฿{money(selectedEmployee.bonus)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      เงินเดือนสุทธิ (รวมโบนัส)
                    </p>
                    <p className="mt-1 text-lg font-bold">
                      ฿
                      {money(
                        Number(isEditing ? editForm.salary || 0 : selectedEmployee.salary) +
                          Number(isEditing ? editForm.bonus || 0 : selectedEmployee.bonus)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <section className="mt-7">
                <h3 className="font-bold">สถิติการทำงานรายเดือน</h3>
                <p className="mt-1 text-sm text-slate-500">
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
                      color: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
                      icon: "calendar",
                    },
                    {
                      type: "ลาป่วย",
                      value: getCount(selectedEmployee.id, "ลาป่วย"),
                      color: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
                      icon: "clipboard",
                    },
                    {
                      type: "ลากิจ",
                      value: getCount(selectedEmployee.id, "ลากิจ"),
                      color: "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
                      icon: "users",
                    },
                    {
                      type: "มาสาย",
                      value: getCount(selectedEmployee.id, "มาสาย"),
                      color: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
                      icon: "clock",
                    },
                  ].map((item) => (
                    <div key={item.type} className={`rounded-xl p-4 ${item.color}`}>
                      <Icon name={item.icon} size={21} />
                      <p className="mt-3 text-sm font-medium">{item.type}</p>
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

              <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setEditForm({
                          salary: String(selectedEmployee.salary ?? 0),
                          bonus: String(selectedEmployee.bonus ?? 0),
                          bank_account:
                            selectedEmployee.bank_account === "-"
                              ? ""
                              : String(selectedEmployee.bank_account ?? ""),
                        });
                        setIsEditing(false);
                      }}
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold disabled:opacity-50 dark:border-slate-700"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleSaveDetails}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    แก้ไขรายละเอียด
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
