export const EmptyState = ({ title, text, icon }: { title: string, text: string, icon: string }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
    <div className="text-6xl mb-4 bg-gray-50 p-6 rounded-full">{icon}</div>
    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    <p className="text-gray-500 mt-2 max-w-xs">{text}</p>
  </div>
);