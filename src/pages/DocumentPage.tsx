import React from 'react';
import Navbar from '../components/layout/Navbar';

const DocumentPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="p-20 text-center">
        <h1 className="text-4xl font-black text-gray-900">도큐먼트 및 AI 채팅 페이지</h1>
        <p className="text-gray-500 mt-4 text-lg">성공적으로 페이지를 이동했습니다!</p>
      </div>
    </div>
  );
};

export default DocumentPage;