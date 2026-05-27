import React from 'react';

interface PlanBadgeProps {
  plan: 'free' | 'pro';
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ plan }) =>
  plan === 'pro' ? (
    <span className="nm-stamp gold">PRO</span>
  ) : (
    <span className="nm-stamp bw">FREE PLAN</span>
  );

export default PlanBadge;
