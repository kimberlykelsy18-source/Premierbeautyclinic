interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = 'Loading…', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`p-16 text-center ${className}`}>
      <div className="w-8 h-8 border-4 border-[#6D4C91] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-400 text-[13px] font-bold uppercase tracking-widest">{message}</p>
    </div>
  );
}
