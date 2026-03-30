import React from 'react';

// 프로젝트 타입을 정의하여 타입 안정성 확보
interface Project {
  id: number;
  title: string;
  description: string;
  members: string[];
  progress: number;
  status: '진행중' | '완료' | '대기';
}

const ProjectPage: React.FC = () => {
  // 데모용 데이터
  const projects: Project[] = [
    {
      id: 1,
      title: "AI-Star 웹 서비스 개발",
      description: "React와 FastAPI를 이용한 AI 학습 보조 플랫폼 구축",
      members: ["나(FE)", "팀원A(BE)", "팀원B(AI)"],
      progress: 35,
      status: '진행중'
    },
    {
      id: 2,
      title: "소프트웨어 공학 과제 02",
      description: "프로세스 모델 비교 분석 및 발표 자료 준비",
      members: ["나", "팀원C"],
      progress: 100,
      status: '완료'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* 상단 헤더 영역 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">내 프로젝트</h1>
          <p className="text-gray-500">참여 중인 프로젝트의 진행 상황을 확인하세요.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
          + 새 프로젝트 생성
        </button>
      </div>

      {/* 프로젝트 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  project.status === '진행중' ? 'bg-blue-100 text-blue-700' : 
                  project.status === '완료' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {project.status}
                </span>
                <span className="text-gray-400 text-lg">⋮</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h2>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{project.description}</p>
            </div>

            <div>
              {/* 진행률 바 */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-bold text-blue-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* 팀원 아이콘 모음 */}
              <div className="flex -space-x-2">
                {project.members.map((member, i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600"
                    title={member}
                  >
                    {member[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectPage;