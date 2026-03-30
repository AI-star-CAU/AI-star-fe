import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const projects = [
    { id: 'new', title: '새로운 프로젝트 생성', desc: '새 소공 프로젝트 시작', isNew: true },
    { id: 1, title: 'AI-Star 웹 서비스', desc: 'React 기반 프론트엔드 작업 중', progress: 45 },
    { id: 2, title: '소프트웨어 공학 과제', desc: '요구사항 명세서 작성', progress: 100 },
    { id: 3, title: '시스템 아키텍처 설계', desc: 'UML 다이어그램 설계', progress: 15 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-[1500px] mx-auto w-full flex flex-col lg:flex-row gap-10 p-12">
        {/* 왼쪽: 프로젝트 리스트 (3/4 비율) */}
        <div className="flex-[3]">
          <h2 className="text-3xl font-[900] text-gray-900 mb-10 tracking-tight">나의 프로젝트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((p) => (
              <div 
                key={p.id} 
                onClick={() => !p.isNew && navigate('/document')} 
                className={`rounded-[2.5rem] p-10 h-72 flex flex-col justify-between transition-all border shadow-sm hover:shadow-xl hover:-translate-y-2 cursor-pointer group ${
                  p.isNew ? 'border-dashed border-gray-300 bg-white hover:border-blue-400' : 'bg-white border-transparent'
                }`}
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${
                    p.isNew ? 'bg-gray-50 text-gray-300 group-hover:text-blue-500' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {p.isNew ? '+' : '📁'}
                  </div>
                  <h3 className={`text-xl font-black mb-2 ${p.isNew ? 'text-gray-400 group-hover:text-blue-600' : 'text-gray-900'}`}>{p.title}</h3>
                  <p className="text-sm text-gray-400 font-medium">{p.desc}</p>
                </div>
                {!p.isNew && (
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${p.progress}%` }}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 오른쪽: 오늘의 학습 제안 (1/4 비율) */}
        <div className="flex-[1] min-w-[320px]">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50 sticky top-32">
            <h2 className="text-xl font-black text-gray-900 mb-8 tracking-tight flex items-center gap-2">
              💡 오늘의 학습 제안
            </h2>
            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 mb-6">
              <p className="text-[11px] font-black text-blue-500 mb-2 uppercase tracking-widest">AI 추천</p>
              <p className="font-bold text-gray-800 leading-snug">"애자일과 폭포수 모델의 실제 차이점"</p>
            </div>
            <button className="w-full py-4 bg-gray-950 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-gray-200">
              학습 시작하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MainPage;