import React from 'react';
import Button from '../../../shared/components/ui/Button';

interface DangerZoneProps {
  onRequestDelete: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({ onRequestDelete }) => (
  <div className="bg-slate-900 border border-red-500/10 rounded-3xl p-5">
    <p className="text-[11px] font-bold text-red-500/60 uppercase tracking-wider mb-4">위험 구역</p>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-300">계정 삭제</p>
        <p className="text-xs text-slate-600 mt-0.5">
          모든 대화 기록과 분기 데이터가 삭제됩니다.
        </p>
      </div>
      <Button
        onClick={onRequestDelete}
        variant="danger"
        size="sm"
        className="flex-shrink-0 ml-4"
      >
        계정 삭제
      </Button>
    </div>
  </div>
);

export default DangerZone;
