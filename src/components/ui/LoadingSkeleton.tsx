export const LoadingSkeleton = () => (
  <div className="container mx-auto px-4 py-10 flex flex-col items-center">
    <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-gray-400 animate-pulse">Завантаження даних...</p>
  </div>
);