import { useState } from 'react';

const initialDepartments = [
  { id: 1, name: 'HR', manager: '—', totalEmployee: 1 },
  { id: 2, name: 'Accounting', manager: '—', totalEmployee: 1 },
  { id: 3, name: 'Operations', manager: '—', totalEmployee: 13 },
];

function Department() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    const name = window.prompt('Enter department name:');

    if (!name?.trim()) return;

    setDepartments((current) => [
      ...current,
      {
        id: Date.now(),
        name: name.trim(),
        manager: '—',
        totalEmployee: 0,
      },
    ]);
  }

  function handleEdit() {
    const selected = departments.find(
      (department) => department.id === selectedId
    );

    if (!selected) {
      window.alert('Please select a department first.');
      return;
    }

    const name = window.prompt('Department name:', selected.name);

    if (!name?.trim()) return;

    setDepartments((current) =>
      current.map((department) =>
        department.id === selectedId
          ? { ...department, name: name.trim() }
          : department
      )
    );
  }

  function handleDelete() {
    if (selectedId === null) {
      window.alert('Please select a department first.');
      return;
    }

    const confirmed = window.confirm('Delete this department?');

    if (!confirmed) return;

    setDepartments((current) =>
      current.filter((department) => department.id !== selectedId)
    );

    setSelectedId(null);
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-5 sm:px-8">
      <h2 className="mb-3 text-3xl font-normal">Department</h2>

      <div className="relative mb-7">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          ⌕
        </span>

        <input
          type="search"
          placeholder="Search department..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-9 w-full rounded-full border border-gray-400 bg-white pl-9 pr-4 text-sm outline-none focus:border-gray-800"
        />
      </div>

      <div className="mb-3 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={handleEdit}
          className="rounded-md bg-gray-300 px-3 py-1.5 text-sm hover:bg-gray-400"
        >
          ✎ Edit
        </button>

        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-green-300 px-3 py-1.5 text-sm hover:bg-green-400"
        >
          ＋ Add
        </button>

        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md bg-red-300 px-3 py-1.5 text-sm hover:bg-red-400"
        >
          − Delete
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {filteredDepartments.map((department) => {
          const isSelected = selectedId === department.id;

          return (
            <article
              key={department.id}
              onClick={() => setSelectedId(department.id)}
              className={`cursor-pointer rounded-md border p-3 transition-colors ${
                isSelected
                  ? 'border-gray-800 bg-gray-100'
                  : 'border-gray-500 bg-white hover:bg-gray-50'
              }`}
            >
              <h3 className="mb-4 text-base font-normal">
                {department.name}
              </h3>

              <div className="mb-2 h-px w-2/3 bg-gray-400" />
              <div className="mb-4 h-px w-1/2 bg-gray-400" />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-700">
                <span>Manager: {department.manager}</span>

                <span>
                  Total Employee: {String(department.totalEmployee).padStart(2, '0')}
                </span>
              </div>
            </article>
          );
        })}

        {filteredDepartments.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">
            No departments found.
          </p>
        )}
      </div>
    </section>
  );
}

export default Department;
