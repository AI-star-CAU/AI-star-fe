import React from 'react';
import Navbar from '../components/layout/Navbar';

const MyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="p-20 text-center">
        <h1 className="text-4xl font-black text-gray-900">마이페이지</h1>
        <p className="text-gray-500 mt-4 text-lg">사용자 정보 및 활동 내역을 확인하는 곳입니다.</p>
      </div>
    </div>
  );
};

export default MyPage;