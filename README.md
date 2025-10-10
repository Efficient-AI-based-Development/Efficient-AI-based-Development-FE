# Efficient FE (Vite + React + TS)

## 개발
```bash
pnpm i
pnpm dev

스택
	•	React + TypeScript + Vite
	•	TanStack Router / TanStack Query
	•	Tailwind CSS + shadcn/ui + lucide-react
	•	Vitest + Testing Library
	•	MSW(Mock API)

폴더 구조

src/
  routes/          # 라우터 정의
  pages/           # 페이지(기능) 단위
  lib/             # 유틸(cn 등)
  mocks/           # MSW

Mock API
	•	개발 모드에서만 활성화
	•	/api/health 응답 예시: { ok: true, time: "..." }
