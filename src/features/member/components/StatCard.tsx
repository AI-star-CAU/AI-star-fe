import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, loading }) => (
  <div className="card-inner p-5">
    <p className="section-label mb-2">{label}</p>
    {loading ? (
      <div className="h-8 w-16 bg-slate-700 rounded-lg animate-pulse" />
    ) : (
      <p className="text-3xl font-black text-white">{value}</p>
    )}
    {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
  </div>
);

export default StatCard;
