const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Submitted: 'bg-blue-100 text-blue-700',
  InReview: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
  Converted: 'bg-purple-100 text-purple-700',
  Initiated: 'bg-gray-100 text-gray-700',
  Sowing: 'bg-lime-100 text-lime-700',
  Crossing: 'bg-orange-100 text-orange-700',
  Transplant: 'bg-teal-100 text-teal-700',
  Selfing: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-green-100 text-green-700',
};

export default function Badge({ value }: { value: string }) {
  const color = statusColors[value] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {value}
    </span>
  );
}
