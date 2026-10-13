
import { useMemo, useState } from "react";

const initialCustomers = [
  { customer_id: 1, customer_firstname: "บริษัท ระยองอุตสาหกรรม", customer_lastname: "จำกัด", phone_number: "038611201", address: "นิคมอุตสาหกรรมมาบตาพุด จ.ระยอง", tax_id: "0105567001001", start_date: "2024-01-15" },
  { customer_id: 2, customer_firstname: "บริษัท บ้านฉางออโต้พาร์ท", customer_lastname: "จำกัด", phone_number: "038602202", address: "อ.บ้านฉาง จ.ระยอง", tax_id: "0105567001002", start_date: "2024-03-01" },
  { customer_id: 3, customer_firstname: "บริษัท เอเชียแพ็กเกจจิ้ง", customer_lastname: "จำกัด", phone_number: "038641203", address: "อ.นิคมพัฒนา จ.ระยอง", tax_id: "0105567001003", start_date: "2024-05-10" },
  { customer_id: 4, customer_firstname: "การไฟฟ้าส่วนภูมิภาค", customer_lastname: "สาขาระยอง", phone_number: "038611204", address: "อ.เมืองระยอง จ.ระยอง", tax_id: "0994000165001", start_date: "2024-06-01" },
  { customer_id: 5, customer_firstname: "การประปาส่วนภูมิภาค", customer_lastname: "สาขาบ้านฉาง", phone_number: "038602205", address: "อ.บ้านฉาง จ.ระยอง", tax_id: "0994000165002", start_date: "2024-08-15" },
  { customer_id: 6, customer_firstname: "หมู่บ้านพฤกษาระยอง", customer_lastname: "นิติบุคคลหมู่บ้านจัดสรร", phone_number: "038621206", address: "ต.ทับมา อ.เมืองระยอง จ.ระยอง", tax_id: "0105567001006", start_date: "2025-01-01" },
  { customer_id: 7, customer_firstname: "หมู่บ้านเดอะกรีนการ์เด้น", customer_lastname: "นิติบุคคลหมู่บ้านจัดสรร", phone_number: "038621207", address: "ต.เนินพระ อ.เมืองระยอง จ.ระยอง", tax_id: "0105567001007", start_date: "2025-02-01" },
  { customer_id: 8, customer_firstname: "บริษัท โกลเด้นโฮมพร็อพเพอร์ตี้", customer_lastname: "จำกัด", phone_number: "038659208", address: "ต.ปลวกแดง อ.ปลวกแดง จ.ระยอง", tax_id: "0105567001008", start_date: "2025-04-01" },
];

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function formatDate(date) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Customers() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const filteredCustomers = useMemo(() => {
  const keyword = search.trim().toLowerCase();

  return customers.filter((customer) =>
    [
      customer.customer_id,
      customer.customer_firstname,
      customer.customer_lastname
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(keyword)
    )
  );
}, [customers, search]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  const saveCustomer = (event) => {
    event.preventDefault();

    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries()
    );

    if (editingCustomer) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.customer_id === editingCustomer.customer_id
            ? { ...customer, ...data }
            : customer
        )
      );
    } else {
      const nextId =
        Math.max(0, ...customers.map((customer) => customer.customer_id)) + 1;

      setCustomers((previous) => [
        ...previous,
        { ...data, customer_id: nextId },
      ]);
    }

    closeModal();
  };

    
  const deleteCustomer = (customer) => {
    const name = `${customer.customer_firstname} ${customer.customer_lastname}`;

    if (!window.confirm(`ต้องการลบ ${name} ใช่หรือไม่?`)) {
      return;
    }

    setCustomers((previous) =>
      previous.filter(
        (item) => item.customer_id !== customer.customer_id
      )
    );
  };


  return (
    <div className="min-h-screen bg-[#f8faff] px-4 py-6 text-[#18345e] sm:px-6 lg:px-9 lg:py-8">
      <main className="mx-auto w-full max-w-[1600px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Customers
          </h1>
          <p className="mt-1 text-sm text-[#8195b8] sm:text-base">
            Manage customer information and service contracts
          </p>
        </div>

        <section className="mb-7 flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl leading-none text-[#8195b8]">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="ค้นหารหัสหรือชื่อของลูกค้า"
              className="w-full rounded-lg border border-[#dce6f6] bg-white py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-[#8195b8] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          
          <div className="flex justify-end">
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#517ea8] hover:bg-[#385e82] px-4 py-3 mt-6 text-sm font-semibold text-white shadow-sm transition "
          >
            <span className="text-xl leading-none">+</span>
            Add Customer
          </button>
        </div>
        </section>

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
                    "Edit",
                    "Delete",
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
                      {formatDate(customer.start_date)}
                    </td>

                    {/* Edit */}
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

                    {/* Delete */}
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

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#18345e]">
                {editingCustomer ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้า"}
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
                <FormField
                  label="ชื่อลูกค้า / ชื่อบริษัท"
                  name="customer_firstname"
                  required
                  defaultValue={editingCustomer?.customer_firstname}
                />

                <FormField
                  label="นามสกุล / ประเภทนิติบุคคล"
                  name="customer_lastname"
                  required
                  defaultValue={editingCustomer?.customer_lastname}
                />

                <FormField
                  label="เบอร์โทรศัพท์"
                  name="phone_number"
                  required
                  defaultValue={editingCustomer?.phone_number}
                />

                <FormField
                  label="เลขผู้เสียภาษี"
                  name="tax_id"
                  defaultValue={editingCustomer?.tax_id}
                />

                <label className="block text-sm text-slate-700 sm:col-span-2">
                  ที่อยู่
                  <textarea
                    name="address"
                    rows={3}
                    defaultValue={editingCustomer?.address ?? ""}
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm text-slate-700 sm:col-span-2">
                  วันที่เริ่มใช้บริการ
                  <input
                    name="start_date"
                    type="date"
                    required
                    defaultValue={editingCustomer?.start_date ?? ""}
                    className={inputClass}
                  />
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
}) {
  return (
    <label className="block text-sm text-slate-700">
      {label}
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        className={inputClass}
      />
    </label>
  );
}
