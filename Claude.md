# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. 변경 사항 기록 (필수)

**모든 수정 작업 후 문서를 갱신한다. 팀원이 변경 내용을 추적할 수 있어야 한다.**

작업을 마치면 항상 다음 두 가지를 확인한다.

1. **[SUMMARY.md](./SUMMARY.md) 갱신 — 모든 수정에 필수.**
   - 코드/설정/문서 등 어떤 수정이든 `SUMMARY.md` **상단**에 새 항목을 추가한다.
   - `SUMMARY.md` 상단의 "작성 규칙" 템플릿(날짜, 유형, 범위, 변경 내용, 영향 범위, 관련)을 그대로 따른다.
   - 유형은 `feat / fix / refactor / docs / chore / style / test` 중에서 고른다.
   - 깨짐 위험이 있으면 제목 앞에 `[BREAKING]` 을 붙인다.

2. **[FILE_STRUCTURE.md](./FILE_STRUCTURE.md) 갱신 — 파일 구조가 바뀐 경우에만.**
   - 다음 중 하나라도 발생하면 반드시 함께 수정한다.
     - 파일/폴더 **추가, 삭제, 이름 변경, 이동**
     - 새로운 **feature** 모듈 추가
     - 레이어 구성(`app / pages / features / shared`) 변경
   - 단순히 기존 파일의 내부 로직만 바뀌었다면 갱신하지 않는다.

이 두 문서는 팀원과의 공유 수단이다. 누락하지 않는다.

## 6. BE 참고 규칙
BE 코드는 기본적으로 적극적으로 참고만 하되, 수정하지 않는다. 
document 폴더에 있는 각각의 phase 별 api 명세를 토대로 FE 코드에 반영한다. 

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.