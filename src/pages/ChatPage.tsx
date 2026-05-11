import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import type { Conversation, Message } from '../api/ait';

// ────────────────────────────────────────────────────────────────
// Graph
// ────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  isCurrent: boolean;
  isBranch: boolean;
}

interface GraphEdge { from: string; to: string }

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  viewW: number;
  viewH: number;
}

function buildGraph(messages: Message[], conv: Conversation | undefined): GraphData {
  const turnCount = Math.max(1, Math.ceil(messages.filter(m => m.role === 'user').length) + 1);
  const branches = conv?.branches ?? [];

  const mainNodes: GraphNode[] = Array.from({ length: turnCount }, (_, i) => ({
    id: `n${i}`,
    x: 56,
    y: 40 + i * 60,
    label: i === 0 ? '시작' : `T${i}`,
    isCurrent: i === turnCount - 1,
    isBranch: false,
  }));

  const branchNodes: GraphNode[] = branches.flatMap((b, bi) => [
    {
      id: `b${bi}a`,
      x: 136,
      y: 40 + b.forkAtTurnIndex * 60,
      label: `B${bi + 1}`,
      isCurrent: false,
      isBranch: true,
    },
    {
      id: `b${bi}b`,
      x: 136,
      y: 40 + (b.forkAtTurnIndex + 1) * 60,
      label: `B${bi + 1}c`,
      isCurrent: false,
      isBranch: false,
    },
  ]);

  const mainEdges: GraphEdge[] = mainNodes.slice(0, -1).map((_, i) => ({
    from: `n${i}`,
    to: `n${i + 1}`,
  }));

  const branchEdges: GraphEdge[] = branches.flatMap((b, bi) => [
    { from: `n${b.forkAtTurnIndex}`, to: `b${bi}a` },
    { from: `b${bi}a`, to: `b${bi}b` },
  ]);

  const allNodes = [...mainNodes, ...branchNodes];
  const viewW = allNodes.reduce((m, n) => Math.max(m, n.x + 56), 0);
  const viewH = allNodes.reduce((m, n) => Math.max(m, n.y + 40), 0);

  return { nodes: allNodes, edges: [...mainEdges, ...branchEdges], viewW, viewH };
}

interface GraphPanelProps {
  graph: GraphData;
}

const GraphPanel: React.FC<GraphPanelProps> = ({ graph }) => {
  const nodeMap = useMemo(
    () => Object.fromEntries(graph.nodes.map(n => [n.id, n])),
    [graph.nodes],
  );

  return (
    <svg
      viewBox={`0 0 ${graph.viewW} ${graph.viewH}`}
      className="w-full overflow-visible"
      style={{ maxWidth: graph.viewW }}
    >
      {graph.edges.map(e => {
        const a = nodeMap[e.from];
        const b = nodeMap[e.to];
        if (!a || !b) return null;
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#334155" strokeWidth="2" strokeLinecap="round"
          />
        );
      })}
      {graph.nodes.map(node => (
        <g key={node.id}>
          <circle
            cx={node.x} cy={node.y} r="16"
            fill={node.isCurrent ? '#2563eb' : node.isBranch ? '#d97706' : '#1e293b'}
            stroke={node.isCurrent ? '#3b82f6' : node.isBranch ? '#f59e0b' : '#334155'}
            strokeWidth="2"
          />
          <text
            x={node.x} y={node.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="700"
            fill={node.isCurrent || node.isBranch ? '#fff' : '#94a3b8'}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

// ────────────────────────────────────────────────────────────────
// Conversation Sidebar
// ────────────────────────────────────────────────────────────────

interface SidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string;
  onSelect: (id: string) => void;
}

const ConvSidebar: React.FC<SidebarProps> = ({ conversations, isLoading, activeId, onSelect }) => {
  const [expandedId, setExpandedId] = useState<string | null>(activeId);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      search.trim()
        ? conversations.filter(
            c =>
              c.title.toLowerCase().includes(search.toLowerCase()) ||
              c.preview.toLowerCase().includes(search.toLowerCase()),
          )
        : conversations,
    [conversations, search],
  );

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
      <div className="p-3 flex-shrink-0">
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5">
          <span className="text-lg leading-none">+</span> 새 대화
        </button>
      </div>

      <div className="px-3 pb-3 flex-shrink-0">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="대화 검색..."
          className="w-full bg-slate-800 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider px-2 py-1.5">
          최근 대화
        </p>

        {isLoading ? (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-slate-600 px-3 py-2">검색 결과 없음</p>
        ) : (
          filtered.map(conv => (
            <div key={conv.id}>
              <div
                onClick={() => {
                  onSelect(conv.id);
                  setExpandedId(expandedId === conv.id ? null : conv.id);
                }}
                className={`px-3 py-2.5 rounded-xl cursor-pointer transition flex items-start justify-between gap-1 ${
                  activeId === conv.id
                    ? 'bg-blue-600/15 border border-blue-500/20'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${activeId === conv.id ? 'text-blue-300' : 'text-slate-300'}`}>
                    {conv.title}
                  </p>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{conv.preview}</p>
                </div>
                {conv.branches.length > 0 && (
                  <span className="text-slate-600 text-xs mt-0.5 flex-shrink-0">
                    {expandedId === conv.id ? '▾' : '▸'}
                  </span>
                )}
              </div>

              {conv.branches.length > 0 && expandedId === conv.id && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {conv.branches.map(b => (
                    <div
                      key={b.id}
                      className="px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-800/40 transition flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      <span className="text-xs text-slate-400 truncate">{b.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

// ────────────────────────────────────────────────────────────────
// Message Bubble
// ────────────────────────────────────────────────────────────────

interface BubbleProps {
  message: Message;
  userName: string;
}

const MessageBubble: React.FC<BubbleProps> = ({ message, userName }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
          isUser ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-blue-600'
        }`}
      >
        {isUser ? userName[0] : 'A'}
      </div>

      <div
        className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-slate-800 text-slate-200 rounded-tl-sm'
        }`}
      >
        {message.isPending ? (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="flex gap-1">
              {[0, 150, 300].map(d => (
                <span
                  key={d}
                  className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
            <span className="text-xs">응답 대기 중...</span>
          </div>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// ChatPage
// ────────────────────────────────────────────────────────────────

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeConvId, setActiveConvId] = useState('c1');
  const [input, setInput] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Data ──────────────────────────────────────────────────────
  const { data: conversations = [], isLoading: convsLoading } = useConversations();
  const { data: messages = [], isLoading: msgsLoading } = useMessages(activeConvId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(activeConvId);

  const activeConv = useMemo(
    () => conversations.find(c => c.id === activeConvId),
    [conversations, activeConvId],
  );

  const graph = useMemo(
    () => buildGraph(messages, activeConv),
    [messages, activeConv],
  );

  // ── Effects ───────────────────────────────────────────────────

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist last active conversation
  useEffect(() => {
    const saved = localStorage.getItem('ait_active_conv');
    if (saved && conversations.find(c => c.id === saved)) {
      setActiveConvId(saved);
    }
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('ait_active_conv', activeConvId);
  }, [activeConvId]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [input]);

  // ── Handlers ─────────────────────────────────────────────────

  const handleSend = useCallback(() => {
    const content = input.trim();
    if (!content || isSending) return;
    setInput('');
    sendMessage(content);
  }, [input, isSending, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleSelectConv = useCallback((id: string) => {
    setActiveConvId(id);
  }, []);

  // ── Render ────────────────────────────────────────────────────

  const userTurnCount = useMemo(
    () => messages.filter(m => m.role === 'user' && !m.isPending).length,
    [messages],
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-xl font-black text-white tracking-tight hover:opacity-80 transition"
          >
            <span className="text-blue-400">A</span>IT
          </button>
          <span className="text-slate-700 text-sm hidden sm:block">
            분기 그래프 기반 대화형 AI 에이전트
          </span>
        </div>

        <div className="flex items-center gap-3">
          {user?.plan === 'free' && (
            <span className="text-[10px] font-bold text-slate-500 border border-slate-700 rounded-lg px-2.5 py-1 hidden sm:block">
              FREE
            </span>
          )}
          <div className="relative group">
            <button className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition">
              {user?.name?.[0] ?? '?'}
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 top-11 w-48 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="px-3 py-2 border-b border-slate-700 mb-1">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => navigate('/mypage')}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-xl transition"
              >
                마이페이지
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Conversation Explorer */}
        <ConvSidebar
          conversations={conversations}
          isLoading={convsLoading}
          activeId={activeConvId}
          onSelect={handleSelectConv}
        />

        {/* Middle: Graph Visualization */}
        <div className="w-52 bg-slate-950 border-r border-slate-800 flex-col flex-shrink-0 hidden md:flex">
          <div className="px-4 py-3 border-b border-slate-800 flex-shrink-0">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">분기 구조</p>
          </div>

          <div className="flex-1 overflow-auto p-4 flex justify-center">
            {msgsLoading ? (
              <div className="flex items-center justify-center w-full">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <GraphPanel graph={graph} />
            )}
          </div>

          <div className="p-3 border-t border-slate-800 flex-shrink-0 space-y-1.5">
            {[
              { color: 'bg-blue-500', label: '현재 위치' },
              { color: 'bg-amber-500', label: '분기 지점' },
              { color: 'bg-slate-700', label: '일반 턴' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                <span className="text-[10px] text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0 bg-slate-900/50">
            <div>
              <h2 className="text-sm font-bold text-white">
                {activeConv?.title ?? '새 대화'}
              </h2>
              <p className="text-[11px] text-slate-600">
                루트 대화 · {userTurnCount}개 턴
                {activeConv && activeConv.branches.length > 0 && ` · 분기 ${activeConv.branches.length}개`}
              </p>
            </div>
            <button className="text-xs text-slate-500 hover:text-slate-200 transition border border-slate-700 hover:border-slate-500 rounded-xl px-3 py-1.5">
              분기 생성
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {msgsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  userName={user?.name ?? '나'}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 flex-shrink-0">
            <div className="flex gap-3 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                rows={1}
                disabled={isSending}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl py-3 pl-4 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed transition disabled:opacity-60"
                style={{ minHeight: '48px', maxHeight: '160px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="h-12 w-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-2xl transition flex items-center justify-center flex-shrink-0"
              >
                {isSending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-700 mt-2 text-center">
              AIT는 현재 백엔드 연결을 준비 중입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
