export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="h-10 w-64 bg-gray-800 rounded mx-auto mb-8 animate-pulse"></div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg overflow-hidden h-96 animate-pulse border border-gray-700">
            <div className="h-64 bg-gray-700 w-full"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-full mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
