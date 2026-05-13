import React from 'react';

interface ResizeHandleProps {
  direction: 'x' | 'y';
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ direction, onMouseDown }) => {
  const isX = direction === 'x';

  return (
    <div
      onMouseDown={onMouseDown}
      className={`flex-shrink-0 group flex items-center justify-center bg-slate-800/60 hover:bg-cyan-500/25 transition-colors select-none ${
        isX
          ? 'w-1.5 cursor-col-resize flex-col gap-1'
          : 'h-1.5 cursor-row-resize flex-row gap-1'
      }`}
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`rounded-full bg-slate-600 group-hover:bg-cyan-300 transition-colors flex-shrink-0 ${
            isX ? 'w-0.5 h-1' : 'h-0.5 w-1'
          }`}
        />
      ))}
    </div>
  );
};

export default ResizeHandle;
