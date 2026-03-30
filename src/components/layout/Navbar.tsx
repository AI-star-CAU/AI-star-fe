import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full h-20 bg-white border-b border-gray-100 px-12 flex items-center justify-between sticky top-0 z-50">
      {/* 왼쪽 로고 */}
      <div 
        onClick={() => navigate('/')} 
        className="text-2xl font-[900] text-blue-600 cursor-pointer tracking-tighter"
      >
        AI-STAR
      </div>

      {/* 오른쪽 프로필 (클릭 시 마이페이지) */}
      <div 
        onClick={() => navigate('/mypage')}
        className="flex items-center gap-4 cursor-pointer group"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">주원님</p>
          <p className="text-[11px] text-gray-400">02juw@cau.ac.kr</p>
        </div>
        <div className="w-11 h-11 bg-blue-600 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center text-white font-bold text-lg">
          주
        </div>
      </div>
    </nav>
  );
};

export default Navbar;