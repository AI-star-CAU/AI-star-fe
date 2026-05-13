import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import PlanBadge from './PlanBadge';
import type { User } from '../../auth/types';

interface ProfileCardProps {
  user: User | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name ?? '');

  return (
    <div className="card overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
      <div className="px-6 pb-6 text-center -mt-12">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 border-4 border-slate-900 flex items-center justify-center text-3xl font-black text-slate-950 shadow-xl">
          {user?.name?.[0] ?? '?'}
        </div>

        {isEditingName ? (
          <div className="mt-4 flex gap-2">
            <input
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-center"
              autoFocus
            />
            <Button onClick={() => setIsEditingName(false)} size="sm">
              저장
            </Button>
          </div>
        ) : (
          <div
            className="mt-4 group cursor-pointer"
            onClick={() => { setEditedName(user?.name ?? ''); setIsEditingName(true); }}
          >
            <h2 className="text-lg font-bold text-white group-hover:text-cyan-200 transition">
              {editedName || user?.name}
            </h2>
            <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition">
              클릭하여 수정
            </span>
          </div>
        )}

        <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
        <div className="mt-3 flex justify-center">
          <PlanBadge plan={user?.plan ?? 'free'} />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
