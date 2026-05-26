import React from 'react';
import Button from '../../../shared/components/ui/Button';

interface PlanCardProps {
  plan: 'free' | 'pro';
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => (
  <div className="card p-5">
    <p className="section-label mb-4">구독 플랜</p>

    {plan === 'free' ? (
      <>
        <div className="mb-4">
          <p className="text-sm text-slate-300 font-semibold">무료 플랜</p>
          <p className="text-xs text-slate-600 mt-1">월 50개 대화, 분기 제한 있음</p>
        </div>
        <Button
          fullWidth
          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 shadow-lg shadow-cyan-400/20"
        >
          Pro로 업그레이드
        </Button>
        <p className="text-[10px] text-slate-600 text-center mt-2">월 9,900원, 언제든 해지 가능</p>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-amber-400">Pro 플랜</p>
            <p className="text-xs text-slate-600 mt-0.5">무제한 대화, 무제한 분기</p>
          </div>
          <span className="text-lg">PRO</span>
        </div>
        <p className="text-xs text-slate-600">다음 결제일: 2026-12-31</p>
        <Button variant="ghost" size="sm" fullWidth className="mt-3">
          플랜 관리
        </Button>
      </>
    )}
  </div>
);

export default PlanCard;
