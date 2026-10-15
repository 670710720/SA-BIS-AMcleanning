import { useEffect, useMemo, useState } from 'react'


import {
  Users,
  Handshake,
  Building2,
  Wallet,
} from 'lucide-react'


const API_ENDPOINTS = {
  employees: '/api/employees',
  customers: '/api/customers',
  departments: '/api/departments',
  payroll: '/api/payroll',
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

// เรียก API และตรวจสอบข้อผิดพลาด
async function apiRequest(url) {
  const response = await fetch(
  `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`,
  )

  const text = await response.text()

  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`API ${url} ไม่ได้ส่งข้อมูล JSON กลับมา`)
  }

  if (!response.ok) {
    throw new Error(
      data?.error || `เรียก ${url} ไม่สำเร็จ (${response.status})`
    )
  }

  if (!Array.isArray(data)) {
    throw new Error(`รูปแบบข้อมูลจาก ${url} ไม่ใช่ Array`)
  }

  return data
}

// การ์ดสรุปข้อมูล
function SummaryCard({
  title,
  value,
  description,
  accent,
  icon,
  loading,
  error,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-3 break-words text-3xl font-semibold text-slate-800">
            {loading ? (
              <span className="text-xl text-slate-400">
                กำลังโหลด...
              </span>
            ) : error ? (
              <span className="text-sm font-medium text-red-500">
                โหลดไม่สำเร็จ
              </span>
            ) : (
              value
            )}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 break-words text-sm text-slate-500">
        {error ? error : description}
      </p>
    </section>
  )
}

function Home() {
  const [data, setData] = useState({
    employees: [],
    customers: [],
    departments: [],
    payroll: [],
  })

  const [loading, setLoading] = useState(true)

  const [errors, setErrors] = useState({
    employees: '',
    customers: '',
    departments: '',
    payroll: '',
  })

  // ดึงข้อมูลแต่ละ API แยกกัน
  // หาก API ใดล้มเหลว API อื่นยังแสดงข้อมูลได้
  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoading(true)

      const resources = Object.keys(API_ENDPOINTS)

      const results = await Promise.allSettled(
        resources.map((key) => apiRequest(API_ENDPOINTS[key]))
      )

      if (cancelled) return

      const nextData = {
        employees: [],
        customers: [],
        departments: [],
        payroll: [],
      }

      const nextErrors = {
        employees: '',
        customers: '',
        departments: '',
        payroll: '',
      }

      results.forEach((result, index) => {
        const key = resources[index]

        if (result.status === 'fulfilled') {
          nextData[key] = result.value
        } else {
          nextErrors[key] =
            result.reason?.message || 'ไม่สามารถโหลดข้อมูลได้'
        }
      })

      setData(nextData)
      setErrors(nextErrors)
      setLoading(false)
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  // คำนวณยอดเงินเดือนรวมจากข้อมูล Payroll
  const payrollSummary = useMemo(() => {
    return data.payroll.reduce(
      (total, item) => {
        const salary = Number(item.salary) || 0
        const bonus = Number(item.bonus) || 0

        return {
          salary: total.salary + salary,
          bonus: total.bonus + bonus,
          total: total.total + salary + bonus,
        }
      },
      { salary: 0, bonus: 0, total: 0 }
    )
  }, [data.payroll])

  // เรียงแผนกตามจำนวนพนักงาน
  const departmentReport = useMemo(() => {
    return [...data.departments].sort(
      (a, b) =>
        (Number(b.employee_count) || 0) -
        (Number(a.employee_count) || 0)
    )
  }, [data.departments])

  const moneyFormatter = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const formatMoney = (amount) =>
    `${moneyFormatter.format(amount)} บาท`

  return (
    <main className="min-h-screen bg-slate-50 p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Page heading */}
        <header>
          <p className="text-sm font-medium text-emerald-700">
            {/* AM CLEANING MANAGEMENT SYSTEM */}
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {/* Dashboard */}
            แดชบอร์ด
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            ภาพรวมข้อมูลการจัดการภายในบริษัท
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            ↻ โหลดข้อมูลใหม่
          </button>
        </header>

        {/* Summary cards */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              ภาพรวมข้อมูล
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              สรุปข้อมูลสำคัญจากฐานข้อมูลของระบบ
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="พนักงานทั้งหมด"
              value={`${data.employees.length} คน`}
              description="พนักงาน"
              accent="bg-emerald-100 text-emerald-700"
              icon={<Users size={24} strokeWidth={2} />}
              loading={loading}
              error={errors.employees}
            />

            <SummaryCard
              title="ลูกค้าทั้งหมด"
              value={`${data.customers.length} ราย`}
              description="ลูกค้า"
              accent="bg-blue-100 text-blue-700"
              icon={<Handshake size={24} strokeWidth={2} />}
              loading={loading}
              error={errors.customers}
            />

            <SummaryCard
              title="แผนกทั้งหมด"
              value={`${data.departments.length} แผนก`}
              description="แผนก"
              accent="bg-amber-100 text-amber-700"
              icon={<Building2 size={24} strokeWidth={2} />}
              loading={loading}
              error={errors.departments}
            />

            <SummaryCard
              title="ข้อมูลเงินเดือน"
              value={`${data.payroll.length} รายการ`}
              description="เงินเดือนพนักงาน"
              accent="bg-violet-100 text-violet-700"
              icon={<Wallet size={24} strokeWidth={2} />}
              loading={loading}
              error={errors.payroll}
            />
          </div>
        </section>

        {/* Employee report */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              รายงานสรุป
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              สรุปจำนวนพนักงานแยกตามแผนกและข้อมูลเงินเดือน
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* Employees by department */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800">
                สรุปข้อมูลพนักงาน
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                จำนวนพนักงานแยกตามแผนก
              </p>

              <div className="mt-5">
                {loading ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    กำลังโหลดข้อมูล...
                  </p>
                ) : errors.departments ? (
                  <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {errors.departments}
                  </p>
                ) : departmentReport.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-400">
                    ยังไม่มีข้อมูลแผนก
                  </p>
                ) : (
                  <div className="space-y-5">
                    {departmentReport.map((department) => {
                      const count =
                        Number(department.employee_count) || 0

                      const total = data.employees.length

                      const percentage =
                        total > 0
                          ? Math.min((count / total) * 100, 100)
                          : 0

                      return (
                        <div key={department.department_id}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-slate-700">
                              {department.department_name}
                            </span>

                            <span className="shrink-0 text-sm font-semibold text-slate-800">
                              {count} คน
                            </span>
                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Payroll report */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800">
                รายงานเงินเดือน
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                สรุปเงินเดือนและโบนัสจากข้อมูลเงินเดือนพนักงาน
              </p>

              <div className="mt-5">
                {loading ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    กำลังโหลดข้อมูล...
                  </p>
                ) : errors.payroll ? (
                  <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {errors.payroll}
                  </p>
                ) : data.payroll.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-400">
                    ยังไม่มีข้อมูลเงินเดือน
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-violet-50 p-4">
                      <p className="text-sm text-violet-700">
                        เงินเดือนรวม + โบนัส
                      </p>

                      <p className="mt-2 break-words text-2xl font-bold text-violet-900">
                        {formatMoney(payrollSummary.total)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        เงินเดือนรวม
                      </span>

                      <span className="text-right text-sm font-semibold text-slate-800">
                        {formatMoney(payrollSummary.salary)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        โบนัสรวม
                      </span>

                      <span className="text-right text-sm font-semibold text-slate-800">
                        {formatMoney(payrollSummary.bonus)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        รายการ เงินเดือน
                      </span>

                      <span className="text-sm font-semibold text-slate-800">
                        {data.payroll.length} รายการ
                      </span>
                    </div>

                    {/* <p className="text-xs leading-5 text-slate-400">
                      ยอดรวมตามรายการที่ API ส่งมา ไม่ใช่การยืนยันยอดจ่ายเงินจริง
                    </p> */}
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400">
            AM Cleaning · Management Dashboard
          </p>
        </footer>

      </div>
    </main>
  )
}

export default Home