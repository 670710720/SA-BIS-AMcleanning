
import { useCallback, useEffect, useState } from 'react';


const API_BASE_URL = (import.meta.env.VITE_API_URL || "")
  .replace(/\/+$/, "");

async function apiRequest(url) {
  const path = `/${url.replace(/^\/+/, "")}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
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
    'แม่บ้าน ดูแลงานทำความสะอาด การจัดพนักงานลงหน้างาน และการให้บริการลูกค้า',
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

  // ลบแผนกจากแถวที่เลือก
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
    <section className="mx-auto w-full max-w-none px-5 py-5 sm:px-8">
      <main className="min-w-0 px-0 py-4 sm:px-0 lg:px-0">
        {/* Page Header */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            จัดการแผนก
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            Department Management
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
            ⌕
          </span>
          <input
            type="search"
            placeholder="ค้นหาด้วยชื่อแผนกหรือรหัสแผนก..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-14 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Add button */}
        <div className="mb-7 flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            disabled={saving || loading}
            className="rounded-xl bg-[#5485b1] px-6 py-4 text-base font-medium text-white shadow-sm transition hover:bg-[#416f99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="mr-2 text-lg">＋</span>
            เพิ่มแผนก
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700"
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

        {/* Department Cards */}
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">
            กำลังโหลด...
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDepartments.map((department) => (
              <article
                key={department.id}
                className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-medium text-slate-400">
                      รหัสแผนก: {department.id}
                    </p>
                    <h3 className="break-words text-xl font-semibold text-slate-900">
                      {department.name}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-xl text-sky-700">
                    <span>▤</span>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-4 min-h-[60px] text-sm leading-6 text-slate-500">
                  {departmentDescriptions[department.name] ||
                    'แสดงรายละเอียดการทำงานของแผนก'}
                </p>

                {/* Employee Count */}
                <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    พนักงานรวม
                  </span>
                  <span className="text-lg font-semibold text-slate-800">
                    {String(department.totalEmployee).padStart(2, '0')}
                    <span className="ml-1 text-sm font-normal text-slate-500">
                      คน
                    </span>
                  </span>
                </div>

                {/* Actions */}
                <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(department)}
                    disabled={saving}
                    className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                  >
                    ✎ แก้ไข
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(department)}
                    disabled={saving}
                    className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    ลบ
                  </button>
                </div>
              </article>
            ))}

            {filteredDepartments.length === 0 && (
              <p className="col-span-full py-10 text-center text-sm text-slate-500">
                ไม่พบข้อมูลแผนก
              </p>
            )}
          </div>
        )}

        {saving && (
          <p className="mt-3 text-right text-xs text-slate-500">
            บันทึกการเปลี่ยนแปลง...
          </p>
        )}
      </main>

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