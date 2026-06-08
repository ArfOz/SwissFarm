export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Total Farms
          </h2>
          <p className="text-3xl font-bold text-green-700 mt-2">5</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Farm Types
          </h2>
          <p className="text-3xl font-bold text-green-700 mt-2">4</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Cantons
          </h2>
          <p className="text-3xl font-bold text-green-700 mt-2">26</p>
        </div>
      </div>
    </div>
  );
}
