export default function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-6 w-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
