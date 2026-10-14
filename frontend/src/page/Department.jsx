import { useCallback, useEffect, useState } from 'react';

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error || text || `Request failed (${response.status})`
    );
  }

  return data;
}

// คำอธิบายแผนก กำหนดใน Frontend เท่านั้น
const departmentDescriptions = {
  ฝ่ายบุคคล: 'ดูแลข้อมูลพนักงาน การรับสมัคร การลา และการจัดการบุคลากร',
  บัญชี:
    'ดูแลบัญชี รายรับรายจ่าย การตรวจสอบเงินเดือน และเอกสารทางการเงิน',
  ฝ่ายปฏิบัติการ:
    'ดูแลงานทำความสะอาด การจัดพนักงานลงหน้างาน และการให้บริการลูกค้า',
};

function Department() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // State สำหรับ Modal เพิ่มและแก้ไขแผนก
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentName, setDepartmentName] = useState('');
  const [modalError, setModalError] = useState('');

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/api/departments');

      if (!Array.isArray(data)) {
        throw new Error('รูปแบบข้อมูลแผนกไม่ถูกต้อง');
      }

      const normalized = data.map((department) => ({
        id: Number(department.department_id),
        name: department.department_name,
        totalEmployee: Number(department.employee_count ?? 0),
      }));

      setDepartments(normalized);
    } catch (err) {
      setError(err.message || 'โหลดข้อมูลแผนกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  // ค้นหาด้วยชื่อแผนกหรือ ID
  const filteredDepartments = departments.filter((department) => {
    const keyword = search.trim().toLowerCase();

    return (
      department.name.toLowerCase().includes(keyword) ||
      String(department.id).includes(keyword)
    );
  });

  // เปิด Modal สำหรับเพิ่มแผนก
  function handleAdd() {
    setEditingDepartment(null);
    setDepartmentName('');
    setModalError('');
    setIsModalOpen(true);
  }

  // เปิด Modal สำหรับแก้ไขแผนกที่เลือก
  function handleEdit(selected) {
    setEditingDepartment(selected);
    setDepartmentName(selected.name);
    setModalError('');
    setIsModalOpen(true);
  }

  // ปิด Modal
  function handleCloseModal() {
    if (saving) return;

    setIsModalOpen(false);
    setEditingDepartment(null);
    setDepartmentName('');
    setModalError('');
  }

  // บันทึกข้อมูลเพิ่มหรือแก้ไขแผนก
  async function handleSubmit(event) {
    event.preventDefault();

    const name = departmentName.trim();

    if (!name) {
      setModalError('กรุณากรอกชื่อแผนก');
      return;
    }

    if (name.length > 15) {
      setModalError('ชื่อแผนกต้องมีความยาวไม่เกิน 15 ตัวอักษร');
      return;
    }

    setSaving(true);
    setModalError('');
    setError('');

    try {
      if (editingDepartment) {
        // แก้ไขแผนก
        await apiRequest(
          `/api/departments/${editingDepartment.id}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              department_name: name,
            }),
          }
        );
      } else {
        // เพิ่มแผนก
        await apiRequest('/api/departments', {
          method: 'POST',
          body: JSON.stringify({
            department_name: name,
          }),
        });
      }

      setIsModalOpen(false);
      setEditingDepartment(null);
      setDepartmentName('');
      await loadDepartments();

      window.alert(
        editingDepartment
          ? 'แก้ไขแผนกสำเร็จ'
          : 'เพิ่มแผนกสำเร็จ'
      );
    } catch (err) {
      setModalError(
        err.message ||
        (editingDepartment
          ? 'แก้ไขแผนกไม่สำเร็จ'
          : 'เพิ่มแผนกไม่สำเร็จ')
      );
    } finally {
      setSaving(false);
    }
  }

  // ลบแผนกจากการ์ดที่กด
  async function handleDelete(selected) {
    const confirmed = window.confirm(
      `Delete department "${selected.name}"?`
    );

    if (!confirmed) return;

    setSaving(true);
    setError('');

    try {
      await apiRequest(`/api/departments/${selected.id}`, {
        method: 'DELETE',
      });

      await loadDepartments();
      window.alert('ลบแผนกสำเร็จ');
    } catch (err) {
      setError(err.message || 'ลบแผนกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-5 sm:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          จัดการแผนก
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          ดูข้อมูลและจัดการแผนก
        </p>
      </div>
      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          ⌕
        </span>

        <input
          type="search"
          placeholder="ค้นหาด้วยชื่อแผนกหรือรหัสแผนก..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 w-full rounded-full border border-gray-400 bg-white pl-9 pr-4 text-sm outline-none focus:border-gray-800"
        />
      </div>

      {/* Add button */}
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || loading}
          className="rounded-md bg-green-300 px-4 py-2 text-sm hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ＋ เพิ่มแผนก
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}

          <button
            type="button"
            onClick={loadDepartments}
            className="ml-2 underline"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      )}

      {/* Department cards */}
      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">
          กำลังโหลด...
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredDepartments.map((department) => (
            <article
              key={department.id}
              className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {department.name}
              </h3>

              <p className="mb-5 mt-1 min-h-10 text-sm leading-5 text-gray-500">
                {departmentDescriptions[department.name] ||
                  'แสดงรายละเอียดการทำงานของแผนก'}
              </p>

              <div className="mb-4 h-px w-full bg-gray-200" />

              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                <span>รหัสแผนก: {department.id}</span>

                <span>
                  พนักงานรวม:{' '}
                  {String(department.totalEmployee).padStart(2, '0')}
                </span>
              </div>

              {/* Actions inside each card */}
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => handleEdit(department)}
                  disabled={saving}
                  className="rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                  ✎ แก้ไข
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(department)}
                  disabled={saving}
                  className="rounded-md bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  − ลบ
                </button>
              </div>
            </article>
          ))}

          {filteredDepartments.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-gray-500">
              ไม่พบข้อมูลแผนก
            </p>
          )}
        </div>
      )}

      {saving && (
        <p className="mt-3 text-right text-xs text-gray-500">
          บันทึกการเปลี่ยนแปลง...
        </p>
      )}

      {/* Modal เพิ่ม / แก้ไขแผนก */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="department-modal-title"
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-gray-200 px-6 py-5 sm:px-8">
              <div>
                <h3
                  id="department-modal-title"
                  className="text-2xl font-semibold text-gray-900"
                >
                  {editingDepartment
                    ? 'แก้ไขแผนก'
                    : 'เพิ่มแผนก'}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  ช่องที่มีเครื่องหมาย{' '}
                  <span className="text-red-500">*</span>{' '}
                  จำเป็นต้องกรอก
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={saving}
                aria-label="ปิดหน้าต่าง"
                className="ml-4 rounded-md px-2 text-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >
              <div className="space-y-5 px-6 py-6 sm:px-8">
                {editingDepartment && (
                  <div>
                    <label
                      htmlFor="department-id"
                      className="mb-2 block text-sm font-medium text-gray-800"
                    >
                      รหัสแผนก
                    </label>

                    <input
                      id="department-id"
                      type="text"
                      value={editingDepartment.id}
                      readOnly
                      className="h-12 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 text-gray-500 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="department-name"
                    className="mb-2 block text-sm font-medium text-gray-800"
                  >
                    ชื่อแผนก <span className="text-red-500">*</span>
                  </label>

                  <input
                    id="department-name"
                    type="text"
                    value={departmentName}
                    onChange={(event) => {
                      setDepartmentName(event.target.value);
                      setModalError('');
                    }}
                    maxLength={15}
                    required
                    autoFocus
                    placeholder="กรอกชื่อแผนก"
                    className="h-12 w-full rounded-lg border border-gray-300 px-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    ความยาวไม่เกิน 15 ตัวอักษร
                  </p>
                </div>

                {modalError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {modalError}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:px-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? 'กำลังบันทึก...'
                    : editingDepartment
                      ? 'บันทึกการแก้ไข'
                      : 'เพิ่มแผนก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Department;
