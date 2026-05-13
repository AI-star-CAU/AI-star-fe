import React from 'react';
import Button from '../ui/Button';

interface ChatAreaHeaderProps {
  title: string;
  turnCount: number;
  branchCount: number;
}

const ChatAreaHeader: React.FC<ChatAreaHeaderProps> = ({ title, turnCount, branchCount }) => (
  <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-900/50">
    <div>
      <h2 className="text-sm font-bold text-white">{title}</h2>
      <p className="text-[11px] text-slate-600">
        루트 대화 · {turnCount}개 턴
        {branchCount > 0 && ` · 분기 ${branchCount}개`}
      </p>
    </div>
    <Button variant="ghost" size="sm">분기 생성</Button>
  </div>
);

export default ChatAreaHeader;
