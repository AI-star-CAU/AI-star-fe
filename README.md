## 링크 및 현재 상태
* 배포 URL: https://tranquil-parfait-300f33.netlify.app
* 현재 상태: 화면 중앙에 **보라색 정사각형**이 보인다면 정상적으로 연동된 것입니다.


## Tech Stack
* Runtime: Node.js (v24.14.0 (LTS))
* Package Manager: npm (v11.9.0)
* Framework: React (v19.0 (Vite v6.2 기반))
* Language: TypeScript (v5.7)
* Infrastructure: Vercel (CD/자동 배포)


## OS별 초기 환경 설정

### 1. Windows
1.  Node.js 설치: [Node.js 공식 홈페이지](https://nodejs.org/)에서 **LTS(v24.14.0)** 버전을 다운로드하여 설치합니다.

2.  확인: 터미널에서 아래 명령어로 설치 여부를 확인합니다.
    node -v  # v24.14.0 출력 확인
    npm -v   # v11.9.0 출력 확인=

### 2. macOS
1.  Node.js: 터미널에서 아래 명령어를 입력합니다.
    brew install node

2.  확인: 터미널에서 아래 명령어로 설치 여부를 확인합니다.
    node -v  # v24.14.0 출력 확인
    npm -v   # v11.9.0 출력 확인=


## Getting Started

### Step 0: git Clone
git clone https://github.com/AI-star-CAU/AI-star-fe.git
cd AI-star-fe

### Step 1: 의존성 라이브러리 설치 (Install)
npm install

### Step 2: 개발 서버 실행 (Run)
npm run dev