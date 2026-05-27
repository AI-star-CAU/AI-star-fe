import React, { useState } from 'react';
import PlanBadge from './PlanBadge';
import type { User } from '../../auth/types';

interface ProfileCardProps {
  user: User | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name ?? '');

  const initial = (user?.name ?? '?')[0];
  const displayName = editedName || user?.name || '사용자';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 24,
        alignItems: 'center',
        padding: '24px 28px',
        border: '1px solid var(--paper-aged)',
        borderRadius: 14,
        background: 'var(--paper-card)',
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          border: '1px solid var(--paper-aged)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--paper-2)',
          color: 'var(--ink)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--serif-display)',
            fontWeight: 600,
            fontSize: 30,
            lineHeight: 1,
          }}
        >
          {initial}
        </span>
      </div>

      <div className="min-w-0">
        <span
          style={{
            fontFamily: 'var(--type)',
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
          }}
        >
          PROFILE
        </span>
        {isEditingName ? (
          <div className="mt-1 flex gap-2 items-end">
            <input
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              className="nm-input"
              style={{ maxWidth: 240 }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setIsEditingName(false)}
              className="nm-btn"
              style={{ height: 36, padding: '0 14px' }}
            >
              저장
            </button>
          </div>
        ) : (
          <h2
            style={{
              margin: '0 0 4px',
              fontFamily: 'var(--serif-display)',
              fontWeight: 900,
              fontSize: 26,
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
            onClick={() => {
              setEditedName(user?.name ?? '');
              setIsEditingName(true);
            }}
            title="클릭하여 이름 수정"
          >
            {displayName}
          </h2>
        )}
        <div
          style={{
            display: 'flex',
            gap: 14,
            marginTop: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <PlanBadge plan={user?.plan ?? 'free'} />
          <span
            style={{
              fontFamily: 'var(--serif)',
              color: 'var(--ink-3)',
              fontSize: 13,
            }}
          >
            {user?.email}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="nm-btn"
        onClick={() => {
          setEditedName(user?.name ?? '');
          setIsEditingName(true);
        }}
      >
        프로필 편집
      </button>
    </div>
  );
};

export default ProfileCard;
