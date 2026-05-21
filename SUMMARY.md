# 변경 사항 요약 (Summary)

이 문서는 작업할 때마다 **무엇을 수정했는지** 팀원에게 공유하기 위한 변경 로그입니다.
새 변경은 **맨 위에 추가**합니다.

## 작성 규칙

- 새 항목은 파일 **상단**(`## 작성 규칙` 아래)에 추가합니다.
- 각 항목은 다음 형식을 따릅니다.

```markdown
## YYYY-MM-DD — 작업자 (한 줄 제목)

**유형:** feat | fix | refactor | docs | chore | style | test
**범위:** features/chat, shared/api, ...

### 변경 내용
- 무엇을 바꿨는지 (불릿)
- ...

### 영향 범위
- 다른 팀원이 알아야 할 사이드 이펙트 / 깨질 수 있는 부분
- 새로 추가된 API, 환경변수, 의존성 등

### 관련
- 이슈/PR: #123
- 관련 파일: [경로](상대경로)
```

- 유형 가이드
  - `feat` — 새 기능
  - `fix` — 버그 수정
  - `refactor` — 동작 변경 없는 구조 개선
  - `docs` — 문서만 수정
  - `chore` — 설정/빌드/의존성
  - `style` — 포매팅·세미콜론 등
  - `test` — 테스트 추가/수정
- 깨짐 위험(Breaking)이 있으면 제목 앞에 `[BREAKING]` 을 붙입니다.

---

## 2026-05-21 — Claude (CLAUDE.md 에 문서 갱신 규칙 추가)

**유형:** docs
**범위:** repo root (AI-star-fe)

### 변경 내용
- [CLAUDE.md](./CLAUDE.md) 에 `5. 변경 사항 기록 (필수)` 섹션 추가
  - 모든 수정 후 [SUMMARY.md](./SUMMARY.md) 상단에 변경 항목을 추가하도록 명시
  - 파일/폴더 추가·삭제·이름 변경·이동, 새 feature 추가, 레이어 변경 시 [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) 도 함께 수정하도록 명시

### 영향 범위
- 코드 변경 없음.
- 앞으로 모든 작업은 작업 종료 시 SUMMARY.md(필수), FILE_STRUCTURE.md(구조 변경 시) 갱신을 포함해야 합니다.

### 관련
- 관련 파일: [CLAUDE.md](./CLAUDE.md), [SUMMARY.md](./SUMMARY.md), [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)

---

## 2026-05-21 — Claude (프로젝트 문서 추가)

**유형:** docs
**범위:** repo root (AI-star-fe)

### 변경 내용
- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) 추가 — `src/` 전체 트리, 레이어 의존 규칙, feature 내부 컨벤션 정리
- [SUMMARY.md](./SUMMARY.md) 추가 — 팀 공유용 변경 로그 템플릿 (이 문서)

### 영향 범위
- 코드 변경 없음. 문서만 추가됨.
- 앞으로 모든 작업 후 이 파일에 변경 사항을 기록해 주세요.

### 관련
- 관련 파일: [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)
