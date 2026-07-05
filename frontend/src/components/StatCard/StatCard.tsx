interface StatCardProps {
  value: number;
  label: string;
}

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="flex flex-col items-center px-2 sm:px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md">
      <span className="text-lg sm:text-xl font-bold text-gray-800">{value}</span>
      <span className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500">{label}</span>
    </div>
  );
}
