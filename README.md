# Efficient FE (Vite + React + TS)

## 🚀 개발 시작하기

### 환경 설정

```bash
# 의존성 설치
pnpm i

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 빌드 미리보기
pnpm preview

# 테스트 실행
pnpm test

# 린트 검사
pnpm lint

# 코드 포맷팅
pnpm format
```

## 🛠 기술 스택

- **프레임워크**: React 19 + TypeScript + Vite
- **라우팅**: TanStack Router (파일 기반 라우팅)
- **상태 관리**: TanStack Query (서버 상태 관리)
- **스타일링**: Tailwind CSS + shadcn/ui + Lucide React
- **테스트**: Vitest + Testing Library + MSW
- **코드 품질**: ESLint + Prettier + Husky

## 📁 프로젝트 구조

```
src/
├── pages/              # 페이지 컴포넌트 (기능별 분리)
│   ├── home/          # 홈 페이지
│   ├── document/      # 문서 관리 페이지
│   ├── task/          # 태스크 관리 페이지
│   └── complete/      # 완료된 작업 페이지
├── routes/            # 라우터 설정
│   ├── root.tsx       # 루트 레이아웃 및 네비게이션
│   └── routeTree.tsx  # 라우트 트리 정의
├── lib/               # 공통 유틸리티 함수
│   └── utils.ts       # 클래스명 유틸리티 등
├── mocks/             # MSW API 목킹 설정
│   ├── handlers.ts    # API 핸들러 정의
│   └── browser.ts     # MSW 브라우저 설정
└── test/              # 테스트 설정
    └── setup.ts       # 테스트 환경 설정
```

## 🎯 개발 가이드라인

### 1. 페이지 추가 방법

새로운 페이지를 추가하려면:

1. `src/pages/` 폴더에 새 폴더 생성
2. 해당 폴더에 `PageName.tsx` 파일 생성
3. `src/routes/routeTree.tsx`에 라우트 추가
4. 네비게이션 업데이트 (필요시)

```typescript
// src/pages/example/ExamplePage.tsx
export default function ExamplePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">예제 페이지</h1>
      <p className="text-gray-600">설명이 여기에...</p>
    </div>
  );
}
```

### 2. API 사용법

TanStack Query를 사용하여 서버 상태 관리:

```typescript
import { useQuery } from '@tanstack/react-query';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData'],
    queryFn: () => fetch('/api/my-endpoint').then(res => res.json()),
  });

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생</div>;

  return <div>{data.message}</div>;
}
```

### 3. 스타일링 가이드라인

- **Tailwind CSS**를 기본으로 사용
- **shadcn/ui** 컴포넌트를 활용하여 일관된 UI 구성
- 커스텀 스타일은 `className` 속성으로 적용

```tsx
import { Button } from "@/components/ui/button";

function StyledComponent() {
  return <Button className="bg-blue-500 hover:bg-blue-600">클릭하세요</Button>;
}
```

### 4. API 목킹 (개발 환경)

MSW를 사용하여 API를 목킹할 수 있습니다:

```typescript
// src/mocks/handlers.ts에 추가
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({ ok: true, time: new Date().toISOString() });
  }),

  // 새로운 API 추가 예시
  http.get("/api/users", () => {
    return HttpResponse.json([{ id: 1, name: "테스트 사용자" }]);
  }),
];
```

### 5. 테스트 작성

Vitest + Testing Library를 사용하여 컴포넌트 테스트:

```typescript
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import MyComponent from './MyComponent';

test('컴포넌트가 정상적으로 렌더링되는지 확인', () => {
  render(<MyComponent />);
  expect(screen.getByText('예상되는 텍스트')).toBeInTheDocument();
});
```

## 🌐 주요 기능

### 네비게이션

- **홈**: 메인 페이지
- **문서**: PRD, SRS, User Story 수정 기능
- **태스크**: 태스크 관리 기능
- **완료**: 완료된 작업 확인

### Mock API 엔드포인트

- `GET /api/health` - 헬스체크 (개발 환경에서만 활성화)

## 📝 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
chore: 설정 변경, 리팩토링 등
test: 테스트 코드 추가/수정
docs: 문서 업데이트
```

## 🚀 배포

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.
