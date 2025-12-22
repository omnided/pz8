import { useMySickLeaves } from '../../features/sick-leave/api';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const MySickLeavesPage = () => {
  const { data: leaves, isLoading } = useMySickLeaves();

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Мої лікарняні</h1>

      {!leaves?.length ? (
        <EmptyState title="Лікарняних немає" text="Ви здорові! Немає активних або архівних лікарняних." icon="🌡️" />
      ) : (
        <div className="grid gap-4">
          {leaves.map((leave) => (
            <div key={leave.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">Лікарняний</span>
                    <span className="text-gray-400 text-xs">#{leave.id}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{leave.diagnosis}</h3>
                  <p className="text-sm text-gray-500">Лікар: {leave.doctor_name}</p>
               </div>

               <div className="bg-gray-50 px-6 py-3 rounded-xl text-center min-w-[200px]">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Період</p>
                  <p className="text-gray-800 font-medium">
                    {new Date(leave.period.start).toLocaleDateString()} — {new Date(leave.period.end).toLocaleDateString()}
                  </p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};