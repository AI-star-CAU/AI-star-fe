import React from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeDate } from '../../../shared/utils/date';
import type { Conversation } from '../../chat/types';

interface RecentConversationsProps {
  conversations: Conversation[];
  isLoading: boolean;
  now: number;
}

const RecentConversations: React.FC<RecentConversationsProps> = ({
  conversations,
  isLoading,
  now,
}) => (
  <div className="nm-side-box">
    <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
      <h4 style={{ margin: 0 }}>최근 대화</h4>
      <Link
        to="/chat"
        style={{
          fontFamily: 'var(--type)',
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--red-deep)',
          borderBottom: '1px dotted var(--red-deep)',
        }}
      >
        모두 보기
      </Link>
    </div>

    {isLoading ? (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              height: 32,
              background: 'var(--paper-aged)',
              opacity: 0.5,
            }}
            className="animate-pulse"
          />
        ))}
      </div>
    ) : conversations.length === 0 ? (
      <div className="text-center" style={{ padding: '20px 0' }}>
        <p
          style={{
            fontFamily: 'var(--body)',
            color: 'var(--ink-3)',
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          대화가 없습니다.
        </p>
        <Link
          to="/chat"
          style={{
            fontFamily: 'var(--type)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--red-deep)',
            borderBottom: '1px solid var(--red-deep)',
          }}
        >
          새 대화 시작
        </Link>
      </div>
    ) : (
      <div>
        {conversations.map(conv => (
          <Link
            key={conv.id}
            to={`/chat/${conv.id}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
              padding: '8px 0',
              borderBottom: '1px dotted var(--rule-thin)',
              fontFamily: 'var(--body)',
              fontSize: 13,
            }}
          >
            <span
              style={{
                color: 'var(--ink)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
              }}
            >
              {conv.title}
            </span>
            <span
              style={{
                color: 'var(--ink-3)',
                fontFamily: 'var(--type)',
                fontSize: 10,
                letterSpacing: '0.12em',
                flexShrink: 0,
              }}
            >
              {conv.branches.length > 0 ? `${conv.branches.length}개 분기` : '—'}
              <span style={{ marginLeft: 8, color: 'var(--ink-faint)' }}>
                {formatRelativeDate(conv.createdAt, now)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default RecentConversations;
