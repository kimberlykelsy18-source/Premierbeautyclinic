interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
}

export function StatCard({ label, value, subtitle, loading = false }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
      <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-[28px] font-bold">{loading ? '—' : value}</p>
      {subtitle && <p className="text-[11px] text-gray-400 font-bold">{subtitle}</p>}
    </div>
  );
}
