/**
 * Tabel data serbaguna (PRD 3.2: "DataTable").
 * Kolom didefinisikan sebagai array agar dipakai bersama tabel produk & pesanan:
 *   columns = [{ key: 'nama', header: 'Nama', render: (row) => ... }]
 */
export function DataTable({
  columns = [],
  rows = [],
  keyField = 'id',
  isLoading = false,
  skeletonRows = 4,
  emptyState = null,
  className = '',
}) {
  return (
    <div className={`overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-cocoa-100 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-cocoa-100 bg-cream-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-cocoa-400 ${
                    column.headerClassName ?? ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-cocoa-100">
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                  <tr key={`skeleton-row-${rowIndex}`}>
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-4">
                        <span className="block h-3 w-3/4 animate-pulse rounded-full bg-cocoa-100" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr key={row[keyField]} className="transition hover:bg-cream-50/70">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3.5 align-middle ${
                          column.cellClassName ?? ''
                        }`}
                      >
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}

            {!isLoading && rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10">
                  {emptyState}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}