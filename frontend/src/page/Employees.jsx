import { useEffect, useMemo, useState } from 'react'

const emptyEmployee = {
  employee_id: '',
  employee_firstname: '',
  employee_lastname: '',
  address: '',
  phone_number: '',
  birth_date: '',
  hire_date: '',
  bank_account: '',
  edu_qualification: '',
  department_id: '',
  id_number: '',
}

const fields = [
  { name: 'employee_id', label: 'รหัสพนักงาน', required: true },
   { name: 'id_number', label: 'เลขบัตรประชาชน', required: true },
  { name: 'employee_firstname', label: 'ชื่อ', required: true },
  { name: 'employee_lastname', label: 'นามสกุล', required: true },
  { name: 'address', label: 'ที่อยู่', required: true },
  { name: 'phone_number', label: 'เบอร์โทรศัพท์', required: true },
  { name: 'birth_date', label: 'วันเกิด', type: 'date', required: true },
  { name: 'hire_date', label: 'วันที่เริ่มงาน', type: 'date' },
  { name: 'bank_account', label: 'เลขบัญชีธนาคาร', required: true },
  { name: 'edu_qualification', label: 'วุฒิการศึกษา', required: true },
  {
    name: 'department_id',
    label: 'รหัสแผนก (Department ID)',
    required: true,
  },
]

// const [departments, setDepartments] = useState([])
// const [loadingDepartments, setLoadingDepartments] = useState(false)

const API_URL = '/api/employees'

// แปลงวันที่จาก API ให้เหมาะกับ input type="date"
function toDateInput(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

// แปลงวันที่สำหรับแสดงในตาราง
function displayDate(value) {
  if (!value) return '-'
  return toDateInput(value)
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

// เรียก API และอ่านข้อความ Error จาก Backend
async function apiRequest(url, options = {}) {
  const response = await fetch(
  `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`,
  )

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.error || `เกิดข้อผิดพลาด HTTP ${response.status}`,
    )
  }

  return data
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)

  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...emptyEmployee })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // โหลดข้อมูลจริงจาก Go Backend เมื่อเปิดหน้า
  async function loadEmployees() {
    setLoading(true)
    setError('')

    try {
      const data = await apiRequest(API_URL)

      if (!Array.isArray(data)) {
        throw new Error('รูปแบบข้อมูลพนักงานจาก API ไม่ถูกต้อง')
      }

      setEmployees(data)
    } catch (err) {
      setError(`โหลดข้อมูลพนักงานไม่สำเร็จ: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // โหลดรายการแผนกจาก Go Backend
  async function loadDepartments() {
    setLoadingDepartments(true)

    try {
      const data = await apiRequest('/api/departments')

      if (!Array.isArray(data)) {
        throw new Error('รูปแบบข้อมูลแผนกไม่ถูกต้อง')
      }

      setDepartments(data)
    } catch (err) {
      setError(`โหลดรายการแผนกไม่สำเร็จ: ${err.message}`)
    } finally {
      setLoadingDepartments(false)
    }
  }

  // ตรวจสอบข้อมูลการเพิ่มของพนักงาน
  function validateEmployee(employee) {
    // 1. ตรวจสอบรหัสพนักงานเป็นตัวเลข 5 หลัก
    const employeeId = String(employee.employee_id ?? '').trim()
    if (!/^\d{5}$/.test(employeeId)) {
      return 'กรุณากรอกรหัสพนักงานเป็นตัวเลข 5 หลัก'
    }
    // 1. ตรวจสอบรหัสพนักงานซ้ำ
    const duplicateId = employees.some(
      (item) =>
        String(item.employee_id).trim().toLowerCase() ===
        employee.employee_id.trim().toLowerCase() &&
        String(item.employee_id) !== String(editingId),
    )

    if (duplicateId) {
      return 'รหัสพนักงานนี้มีอยู่ในระบบแล้ว'
    }

    // 2. ตรวจสอบเบอร์โทรศัพท์: ตัวเลข 9–10 หลัก
    const phone = String(employee.phone_number ?? '').replace(/\D/g, '')

    if (!/^0\d{9}$/.test(phone)) {
      return 'กรุณากรอกเบอร์โทรศัพท์มือถือ 10 หลัก โดยขึ้นต้นด้วย 0'
    }

    // 3. ตรวจสอบเลขบัญชีธนาคาร: ตัวเลข 10–16 หลัก
    const bankAccount = String(employee.bank_account ?? '').trim()

    if (!/^\d{10,16}$/.test(bankAccount)) {
      return 'กรุณากรอกเลขบัญชีธนาคารเป็นตัวเลข 10–16 หลัก'
    }
    
    // ตรวจสอบเลขบัตรประชาชน 13 หลัก
    const idNumber = String(employee.id_number ?? '').trim()

    if (!/^\d{13}$/.test(idNumber)) {
      return 'กรุณากรอกเลขบัตรประชาชนเป็นตัวเลข 13 หลัก'
    }
     // ตรวจสอบเลขบัตรประชาชนซ้ำ
    const duplicateIdNumber = employees.some(
      (item) =>
        String(item.id_number ?? '').trim() === idNumber &&
        String(item.employee_id) !== String(editingId)
    )

    if (duplicateIdNumber) {
      return 'เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว'
    }

    return ''
  }


  useEffect(() => {
    loadEmployees()
    loadDepartments()
  }, [])

  const filteredEmployees = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return employees

    return employees.filter((employee) =>
      [
        employee.employee_id,
        employee.employee_firstname,
        employee.employee_lastname,
        employee.phone_number,
        employee.department_id,
      ].some((value) =>
        String(value ?? '').toLowerCase().includes(keyword),
      ),
    )
  }, [employees, search])

  function openAddModal() {
    setEditingId(null)
    setForm({ ...emptyEmployee })
    setError('')
    setIsModalOpen(true)
  }

  function openEditModal(employee) {
    setEditingId(employee.employee_id)

    setForm({
      ...emptyEmployee,
      ...employee,
      employee_id: String(employee.employee_id ?? ''),
      department_id: String(employee.department_id ?? ''),
      birth_date: toDateInput(employee.birth_date),
      hire_date: toDateInput(employee.hire_date),
      address: employee.address ?? '',
      phone_number: employee.phone_number ?? '',
      bank_account: employee.bank_account ?? '',
      edu_qualification: employee.edu_qualification ?? '',
    })

    setError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setIsModalOpen(false)
    setError('')
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }


  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const normalized = {
      ...form,
      employee_id: form.employee_id.trim(),
      id_number: form.id_number.trim(),
      employee_firstname: form.employee_firstname.trim(),
      employee_lastname: form.employee_lastname.trim(),
      address: form.address.trim(),
      phone_number: form.phone_number.trim(),
      birth_date: form.birth_date,
      bank_account: form.bank_account.trim(),
      edu_qualification: form.edu_qualification.trim(),
      department_id: form.department_id.trim(),
    }

    const requiredFields = fields.filter((field) => field.required)

    const missingField = requiredFields.find(
      (field) => !String(normalized[field.name] ?? '').trim(),
    )

    if (missingField) {
      setError(`กรุณากรอก${missingField.label}`)
      return
    }


    const validationError = validateEmployee(normalized)

    if (validationError) {
      setError(validationError)
      return
    }

    // hire_date เว้นว่างได้
    const payload = { ...normalized }
    delete payload.hire_date

    if (form.hire_date) {
      payload.hire_date = form.hire_date
    }

    setSaving(true)

    try {
      if (editingId !== null) {
        // แก้ไขข้อมูลพนักงาน
        const { employee_id, ...updatePayload } = payload

        await apiRequest(
          `${API_URL}/${encodeURIComponent(editingId)}`,
          {
            method: 'PUT',
            body: JSON.stringify(updatePayload),
          },
        )
      } else {
        // เพิ่มข้อมูลพนักงาน
        await apiRequest(API_URL, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
      }

      setIsModalOpen(false)
      setForm({ ...emptyEmployee })
      await loadEmployees()
    } catch (err) {
      setError(err.message || 'บันทึกข้อมูลไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }


  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `ต้องการลบพนักงาน ${employee.employee_firstname} ${employee.employee_lastname} หรือไม่?`,
    )

    if (!confirmed) return

    setError('')

    try {
      await apiRequest(
        `${API_URL}/${encodeURIComponent(employee.employee_id)}`,
        { method: 'DELETE' },
      )

      await loadEmployees()
    } catch (err) {
      setError(`ลบข้อมูลไม่สำเร็จ: ${err.message}`)
    }
  }

  // การแสดงผล
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* หัวข้อหน้า */}
        <div className="mb-6 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                จัดการพนักงาน
              </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Employee Management
          </p>
        </div>

        {/* แจ้งเตือนข้อผิดพลาด */}
        {error && !isModalOpen && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={loadEmployees}
              className="ml-3 font-semibold underline"
            >
              ลองโหลดใหม่
            </button>
          </div>
        )}

        {/* ช่องค้นหา */}
        <div className="mb-4 w-full">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหารหัสหรือชื่อพนักงาน"
              className="box-border w-full rounded-lg border border-slate-300 bg-white px-5 py-2.5 pl-9 pr-3 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* ปุ่มเพิ่มพนักงาน*/}
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#517ea8] hover:bg-[#385e82] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          // bg-blue-600
          >
            <span className="text-xl leading-none">+</span>
            เพิ่มพนักงาน
          </button>
        </div>

        {/* ตารางพนักงาน */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="px-6 py-16 text-center text-slate-500">
              กำลังโหลดข้อมูลพนักงาน...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] border-separate border-spacing-0 text-left text-sm">
                <thead className="bg-[#8bcaf9] text-[#244570]">
                  {/* "bg-slate-100 text-xs uppercase text-slate-600" */}
                  <tr>
                    {[
                      ['employee_id', 'รหัสพนักงาน'],
                      ['id_number', 'เลขบัตรประชาชน'],
                      ['employee_firstname', 'ชื่อ'],
                      ['employee_lastname', 'นามสกุล'],
                      ['address', 'ที่อยู่'],
                      ['phone_number', 'เบอร์โทรศัพท์'],
                      ['birth_date', 'วันเกิด'],
                      ['hire_date', 'วันที่เริ่มงาน'],
                      ['bank_account', 'บัญชีธนาคาร'],
                      ['edu_qualification', 'วุฒิการศึกษา'],
                      ['department_id', 'รหัสแผนก'],
                    ].map(([key, label], index) => (
                      <th
                        key={key}
                        className={`whitespace-nowrap px-4 py-4 text-sm font-bold text-slate-700 ${index === 0 ? 'rounded-tl-xl' : ''
                          }`}
                      >
                        {label}
                      </th>
                    ))}

                    <th className="whitespace-nowrap rounded-tr-xl px-4 py-4 text-center text-sm font-bold text-slate-700">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.employee_id}
                      className="transition hover:bg-blue-50/40"
                    >
                      {fields.map((field) => (
                        <td
                          key={field.name}
                          className="max-w-64 whitespace-nowrap border-b border-slate-100 px-4 py-4 text-slate-700"
                        >
                          {field.type === 'date'
                            ? displayDate(employee[field.name])
                            : employee[field.name] ?? '-'}
                        </td>
                      ))}

                      <td className="whitespace-nowrap border-b border-slate-100 px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(employee)}
                            className="rounded-md border border-blue-200 px-3 py-1.5 font-medium text-blue-700 transition hover:bg-blue-50"
                          >
                            แก้ไข
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(employee)}
                            className="rounded-md border border-red-200 px-3 py-1.5 font-medium text-red-600 transition hover:bg-red-50"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredEmployees.length === 0 && (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-6 py-16 text-center"
                      >
                        <p className="font-medium text-slate-600">
                          {search
                            ? 'ไม่พบข้อมูลพนักงานที่ค้นหา'
                            : 'ยังไม่มีข้อมูลพนักงาน'}
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                          {search
                            ? 'ลองค้นหาด้วยคำอื่น'
                            : 'กดปุ่ม “เพิ่มพนักงาน” เพื่อเริ่มต้น'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ข้อความใต้ตาราง */}
          <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
            เลื่อนตารางไปทางขวาเพื่อดูข้อมูลทุกคอลัมน์
          </div>
        </section>
      </div>

      {/* Modal เพิ่ม / แก้ไขพนักงาน */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeModal();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-modal-title"
            className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* หัว Modal */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2
                  id="employee-modal-title"
                  className="text-xl font-bold text-slate-800"
                >
                  {editingId !== null
                    ? 'แก้ไขข้อมูลพนักงาน'
                    : 'เพิ่มพนักงาน'}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  ช่องที่มีเครื่องหมาย * จำเป็นต้องกรอก
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="ปิดหน้าต่าง"
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* ฟอร์มพนักงาน */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field.name} className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      {field.label}

                      {field.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </span>


                    {field.name === 'department_id' ? (
                      <select
                        name={field.name}
                        value={form[field.name] ?? ''}
                        onChange={handleChange}
                        required={field.required}
                        disabled={saving || loadingDepartments}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-70"
                      >
                        <option value="">
                          {loadingDepartments ? 'กำลังโหลดแผนก...' : 'เลือกแผนก'}
                        </option>

                        {departments.map((department) => (
                          <option
                            key={department.department_id}
                            value={String(department.department_id)}
                          >
                            {department.department_name
                              ? `${department.department_id} - ${department.department_name}`
                              : department.department_id}
                          </option>
                        ))}
                      </select>
                    ) : field.name === 'edu_qualification' ? (
                      <select
                        name={field.name}
                        value={form[field.name] ?? ''}
                        onChange={handleChange}
                        required={field.required}
                        disabled={saving}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-70"
                      >
                        <option value="">เลือกวุฒิการศึกษา</option>
                        {[
                          'มัธยมศึกษาตอนต้น',
                          'มัธยมศึกษาตอนปลาย',
                          'ปวช.',
                          'ปวส. / อนุปริญญา',
                          'ปริญญาตรี',
                          'ปริญญาโท',
                          'ปริญญาเอก',
                          'อื่น ๆ',
                        ].map((qualification) => (
                          <option key={qualification} value={qualification}>
                            {qualification}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        name={field.name}
                        value={form[field.name] ?? ''}
                        onChange={handleChange}
                        required={field.required}
                        readOnly={
                          field.name === 'employee_id' && editingId !== null
                        }
                        disabled={saving}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 read-only:bg-slate-100 disabled:opacity-70"
                      />
                    )}

                  </label>
                ))}
              </div>

              {/* ข้อผิดพลาดในฟอร์ม */}
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {/* ปุ่มบันทึกและยกเลิก */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {saving
                    ? 'กำลังบันทึก...'
                    : editingId !== null
                      ? 'บันทึกการแก้ไข'
                      : 'เพิ่มพนักงาน'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
