import React from 'react';

const RightSidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex w-80 lg:w-96 border-l border-gray-200 bg-white shadow-sm flex-col h-[calc(100vh-5rem)] sticky top-20 flex-shrink-0">
      {/* Tools Section */}
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
          <span>🛠</span> Tools
        </h3>
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm text-sm">
            요약하기
          </button>
          <button className="flex-1 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm text-sm">
            번역하기
          </button>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-grow flex flex-col p-6 overflow-hidden bg-slate-50/50">
        <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider flex items-center gap-2">
          <span>🤖</span> AI Chat Assistant
        </h3>
        
        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto space-y-5 mb-4 pr-1">
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] text-gray-400 font-bold ml-1">AI Agent</span>
            <div className="bg-white border border-slate-200 text-slate-700 p-3.5 px-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm">
              무엇을 도와드릴까요? 문서 번역, 요약, 또는 프로젝트 관리에 대해 질문해주세요.
            </div>
          </div>
          
          <div className="flex flex-col gap-1 items-end">
             <span className="text-[10px] text-gray-400 font-bold mr-1">나</span>
            <div className="bg-[#1E293B] text-white p-3.5 px-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-md">
              이 문서의 핵심 내용을 3줄로 요약해줘.
            </div>
          </div>
          
          <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] text-gray-400 font-bold ml-1">AI Agent</span>
            <div className="bg-blue-50 border border-blue-100 text-blue-900 p-3.5 px-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-sm">
              <p className="mb-2">네, 현재 문서는 다음과 같은 핵심 내용을 담고 있습니다:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>소프트웨어 공학의 중요성</li>
                <li>애자일 방법론의 주요 특징</li>
                <li>프로젝트 관리 도구 활용법 및 실무 적용</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="relative mt-auto">
          <input 
            type="text" 
            placeholder="AI에게 무엇이든 물어보세요..." 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          />
          <button className="absolute right-1.5 top-1.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
