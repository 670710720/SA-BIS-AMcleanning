import { useEffect, useMemo, useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ค้นหาข้อมูลลูกค้า
  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return customers.filter((customer) =>
      [
        customer.customer_id,
        customer.customer_firstname,
        customer.customer_lastname,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      )
    );
  }, [customers, search]);

  // โหลดข้อมูลลูกค้า
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลลูกค้าได้");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("รูปแบบข้อมูลลูกค้าไม่ถูกต้อง");
      }

      setCustomers(data);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // เปิดฟอร์มเพิ่มลูกค้า
  const openAddModal = () => {
    setEditingCustomer(null);
    setError("");
    setModalOpen(true);
  };

  // เปิดฟอร์มแก้ไขลูกค้า
  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setError("");
    setModalOpen(true);
  };

  // ปิดฟอร์ม
  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  // เพิ่มและแก้ไขข้อมูลลูกค้า
  // เพิ่มและแก้ไขข้อมูลลูกค้า
  const saveCustomer = async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries()
    );

    const isEditing = Boolean(editingCustomer);

    try {
      setError("");

      // ใช้รหัสจาก URL ตอนแก้ไข ไม่ส่ง customer_id ใน body
      if (isEditing) {
        delete data.customer_id;
      }

      const url = isEditing
        ? `/api/customers/${editingCustomer.customer_id}`
        : "/api/customers";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error ||
          `บันทึกข้อมูลลูกค้าไม่สำเร็จ (${response.status})`
        );
      }

      await loadCustomers();
      closeModal();
    } catch (err) {
      setError(
        err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
      );
    }
  };

  // ลบข้อมูลลูกค้า
  const deleteCustomer = async (customer) => {
    const name = `${customer.customer_firstname} ${customer.customer_lastname}`;

    if (!window.confirm(`ต้องการลบ ${name} ใช่หรือไม่?`)) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/customers/${customer.customer_id}`,
        { method: "DELETE" }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error ||
          `ลบข้อมูลลูกค้าไม่สำเร็จ (${response.status})`
        );
      }

      await loadCustomers();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] px-4 py-6 text-[#18345e] sm:px-6 lg:px-9 lg:py-8">
      <main className="mx-auto w-full max-w-[1600px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                ข้อมูลลูกค้า
              </h1>
          <p className="my-3 text-sm text-[#8195b8] sm:text-base">
            Manage customer information and service contracts
          </p>
        </div>

        {/* ค้นหา */}
        <section className="mb-7 flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl leading-none text-[#8195b8]">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหารหัส ชื่อ-นามสกุลลูกค้า"
              className="w-full rounded-lg border border-[#dce6f6] bg-white py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-[#8195b8] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#517ea8] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#385e82]"
            >
              <span className="text-xl leading-none">+</span>
              เพิ่มข้อมูลลูกค้า
            </button>
          </div>
        </section>

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {loading && (
          <p className="mb-4 text-sm text-slate-500">
            กำลังโหลดข้อมูลลูกค้า...
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-[#e0e9f8] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#8bcaf9] text-[#244570]">
                <tr>
                  {[
                    "รหัสลูกค้า",
                    "ชื่อลูกค้า",
                    "ที่อยู่",
                    "เบอร์โทรศัพท์",
                    "เลขผู้เสียภาษี",
                    "วันที่เริ่มใช้บริการ",
                    "ประเภทบริการ",
                    "แก้ไข",
                    "ลบ",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-6 py-4 font-semibold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.customer_id}
                    className="border-t border-[#e6edf8] transition hover:bg-blue-50/50"
                  >
                    <td className="whitespace-nowrap px-6 py-5 text-[#45648e]">
                      {customer.customer_id}
                    </td>

                    <td className="max-w-[250px] px-6 py-5">
                      <p className="font-medium text-[#294b78]">
                        {customer.customer_firstname}
                      </p>
                      <p className="mt-1 text-xs text-[#8195b8]">
                        {customer.customer_lastname}
                      </p>
                    </td>

                    <td className="max-w-[300px] whitespace-normal px-6 py-5 text-[#45648e]">
                      {customer.address}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-[#45648e]">
                      {customer.phone_number}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-[#45648e]">
                      {customer.tax_id}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-[#45648e]">
                      {customer.start_date
                        ? String(customer.start_date).slice(0, 10)
                        : ""}
                    </td>

                    <td className="whitespace-nowrap px-6 py-5 text-[#45648e]">
                      {customer.type_service}
                    </td>

                    {/* แก้ไข */}
                    <td className="px-6 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(customer)}
                        title="แก้ไขข้อมูลลูกค้า"
                        aria-label="แก้ไขข้อมูลลูกค้า"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
                        </svg>
                      </button>
                    </td>

                    {/* ลบ */}
                    <td className="px-6 py-5 text-center">
                      <button
                        type="button"
                        onClick={() => deleteCustomer(customer)}
                        title="ลบข้อมูลลูกค้า"
                        aria-label="ลบข้อมูลลูกค้า"
                        className="inline-flex items-center justify-center rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-16 text-center text-[#8195b8]"
                    >
                      ไม่พบข้อมูลลูกค้า
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ฟอร์มเพิ่มและแก้ไขลูกค้า */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#18345e]">
                {editingCustomer
                  ? "แก้ไขข้อมูลลูกค้า"
                  : "เพิ่มลูกค้า"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-2 py-1 text-2xl text-slate-500 hover:bg-slate-100"
                aria-label="ปิด"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveCustomer} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {editingCustomer && (
                  <FormField
                    label="รหัสลูกค้า"
                    name="customer_id"
                    readOnly
                    defaultValue={editingCustomer.customer_id}
                  />
                )}

                <FormField
                  label="ชื่อ"
                  name="customer_firstname"
                  required
                  defaultValue={
                    editingCustomer?.customer_firstname ?? ""
                  }
                />

                <FormField
                  label="นามสกุล"
                  name="customer_lastname"
                  required
                  defaultValue={
                    editingCustomer?.customer_lastname ?? ""
                  }
                />

                <FormField
                  label="เบอร์โทรศัพท์"
                  name="phone_number"
                  required
                  defaultValue={editingCustomer?.phone_number ?? ""}
                />

                <FormField
                  label="เลขผู้เสียภาษี"
                  name="tax_id"
                  required
                  defaultValue={editingCustomer?.tax_id ?? ""}
                />

                <label className="block text-sm text-slate-700 sm:col-span-2">
                  ที่อยู่
                  <span className="ml-1 text-red-500">*</span>

                  <textarea
                    name="address"
                    rows={3}
                    required
                    defaultValue={editingCustomer?.address ?? ""}
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm text-slate-700 sm:col-span-2">
                  วันที่เริ่มใช้บริการ
                  <span className="ml-1 text-red-500">*</span>

                  <input
                    name="start_date"
                    type="date"
                    required
                    defaultValue={
                      editingCustomer?.start_date
                        ? String(editingCustomer.start_date).slice(0, 10)
                        : ""
                    }
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm text-slate-700 sm:col-span-2">
                  ประเภทบริการ
                  <span className="ml-1 text-red-500">*</span>

                  <select
                    name="type_service"
                    required
                    defaultValue={editingCustomer?.type_service ?? ""}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      -- เลือกประเภทบริการ --
                    </option>
                    <option value="รายวัน">รายวัน</option>
                    <option value="รายเดือน">รายเดือน</option>
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  name,
  required = false,
  defaultValue = "",
  className = "",
  readOnly = false,
}) {
  return (
    <label className={`block text-sm text-slate-700 ${className}`}>
      {label}
      {required && (
        <span className="ml-1 text-red-500">*</span>
      )}

      <input
        type={
          name === "phone_number"
            ? "tel"
            : name === "customer_id"
              ? "text"
              : "text"
        }
        name={name}
        required={required}
        readOnly={readOnly}
        defaultValue={defaultValue ?? ""}
        className={`${inputClass} ${readOnly ? "cursor-not-allowed bg-slate-100" : ""
          }`}
      />
    </label>
  );
}