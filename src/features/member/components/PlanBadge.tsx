import React from 'react';

interface PlanBadgeProps {
  plan: 'free' | 'pro';
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ plan }) =>
  plan === 'pro' ? (
    <span className="badge-pro">PRO</span>
  ) : (
    <span className="badge-free">FREE</span>
  );

export default PlanBadge;
