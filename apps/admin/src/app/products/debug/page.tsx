export default async function ProductsDebugPage() {
  const res = await fetch('http://localhost:3300/api/farms/products', {
    cache: 'no-store',
  });
  const products = await res.json();

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">All Products ({products.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p: any, i: number) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {p.category ?? 'Not set'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}