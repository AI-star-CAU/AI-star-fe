import type React from 'react';

const LEGEND_ITEMS = [
  { className: 'bg-rose-700 border border-rose-400', label: '선택한 노드' },
  { className: 'bg-ui-accent border border-ui-surface-raised', label: '선택한 흐름' },
  { className: 'bg-ui-surface-raised', label: 'root' },
  { className: 'bg-ui-surface-subtle border border-ui-line-muted', label: '턴(Q+A)' },
  { className: 'bg-amber-600', label: '분기 지점' },
];

const GraphLegend: React.FC = () => (
  <div className="px-4 pb-3 space-y-1.5 flex-shrink-0">
    {LEGEND_ITEMS.map(({ className, label }) => (
      <div key={label} className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${className} flex-shrink-0`} />
        <span className="text-[10px] text-ui-text-soft">{label}</span>
      </div>
    ))}
  </div>
);

export default GraphLegend;
