
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

  async function handleAdd() {
    const name = window.prompt('กรอกชื่อแผนก:');

    if (!name?.trim()) return;

    if (name.trim().length > 15) {
      window.alert('Department name must not exceed 15 characters.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await apiRequest('/api/departments', {
        method: 'POST',
        body: JSON.stringify({
          department_name: name.trim(),
        }),
      });

      await loadDepartments();
      window.alert('เพิ่มแผนกสำเร็จ');
    } catch (err) {
      setError(err.message || 'เพิ่มแผนกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  // แก้ไขแผนกจากการ์ดที่กด
  async function handleEdit(selected) {
    const name = window.prompt('Department name:', selected.name);

    if (!name?.trim()) return;

    if (name.trim().length > 15) {
      window.alert('Department name must not exceed 15 characters.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await apiRequest(`/api/departments/${selected.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          department_name: name.trim(),
        }),
      });

      await loadDepartments();
      window.alert('แก้ไขแผนกสำเร็จ');
    } catch (err) {
      setError(err.message || 'แก้ไขแผนกไม่สำเร็จ');
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
      <h2 className="mb-3 text-3xl font-normal">จัดการตำแหน่ง</h2>

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
              {/* Department name */}
              <h3 className="text-lg font-semibold text-gray-800">
                {department.name}
              </h3>

              {/* Description */}
              <p className="mb-5 mt-1 min-h-10 text-sm leading-5 text-gray-500">
                {departmentDescriptions[department.name] ||
                  'แสดงรายละเอียดการทำงานของแผนก'}
              </p>

              <div className="mb-4 h-px w-full bg-gray-200" />

              {/* Department information */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                <span>
                  รหัสแผนก: {department.id}
                </span>

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
    </section>
  );
}

export default Department;
