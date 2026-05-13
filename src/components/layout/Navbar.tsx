import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full h-20 bg-[#1E293B] border-b border-slate-800 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50 shadow-md">
      {/* 왼쪽 로고 */}
      <div 
        onClick={() => navigate('/')} 
        className="text-2xl font-[900] text-white cursor-pointer tracking-tighter flex items-center gap-1.5"
      >
        <span className="text-cyan-300">A</span>IT
      </div>

      {/* 오른쪽 프로필 (클릭 시 마이페이지) */}
      <div 
        onClick={() => navigate('/mypage')}
        className="flex items-center gap-4 cursor-pointer group"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">주원님</p>
          <p className="text-[11px] text-slate-400">02juw@cau.ac.kr</p>
        </div>
        <div className="w-11 h-11 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl shadow-lg shadow-black/30 flex items-center justify-center text-slate-950 font-bold text-lg border border-slate-700/50 group-hover:shadow-cyan-400/20 transition-all">
          주
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
