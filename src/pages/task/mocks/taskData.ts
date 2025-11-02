import type { Task } from "../../../types/task";

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "홈페이지 화면 구현",
    type: "DEV",
    typeNumber: 1,
    status: "TODO",
    priority: 8,
    content: `## 홈페이지 화면 구현

### 요구사항
- 반응형 레이아웃 구현
- 메인 히어로 섹션 추가
- 네비게이션 메뉴 구성
- 푸터 영역 디자인

### 구현 세부사항
- React 컴포넌트 구조로 개발
- Tailwind CSS 활용
- 모바일/태블릿/데스크톱 대응
- 다크모드 지원 고려

### 테스트 전략
- 단위 테스트: 컴포넌트별 렌더링 검증
- 통합 테스트: 라우팅 및 상호작용 확인
- E2E 테스트: Cypress를 이용한 사용자 시뮬레이션`,
  },
  {
    id: "2",
    title: "홈페이지 화면 구현",
    type: "DESIGN",
    typeNumber: 1,
    status: "TODO",
    priority: 8,
    content: `## 홈페이지 디자인

### 디자인 가이드
- 컬러 팔레트 정의
- 타이포그래피 시스템 구축
- 스페이싱 규칙 설정
- 컴포넌트 라이브러리 구성

### 주요 화면
- 메인 페이지
- 소개 섹션
- 서비스 소개
- 문의하기`,
  },
  {
    id: "3",
    title: "로그인 페이지 구현",
    type: "DEV",
    typeNumber: 3,
    status: "IN_PROGRESS",
    priority: 9,
    content: `## 로그인 페이지 구현

### 요구사항
- Auth0를 활용한 사용자 인증 시스템 구축
- 회원가입, 로그인, 로그아웃 기능 구현
- Next.js와 EasyNext 프레임워크 통합

### 구현 세부사항
- Auth0 SDK 설정 및 환경 변수 구성
- Next.js API 라우트에 인증 미들웨어 적용
- 클라이언트에서 Auth0 React SDK를 사용한 인증 흐름 구현
- 세션 관리 및 토큰 갱신 로직 포함

### 테스트 전략
- 단위 테스트: 인증 유효성 및 토큰 처리 로직 검증
- 통합 테스트: 로그인/로그아웃 흐름 시나리오 검증
- E2E 테스트: Cypress를 이용한 사용자 시뮬레이션`,
  },
  {
    id: "4",
    title: "홈페이지 화면 구현",
    type: "DEV",
    typeNumber: 1,
    status: "REVIEW",
    priority: 8,
    content: `## 홈페이지 화면 구현

### 완료 사항
- 반응형 레이아웃 완성
- 주요 섹션 구현 완료
- 애니메이션 효과 추가

### 리뷰 포인트
- 코드 품질 검토
- 성능 최적화 확인
- 접근성 개선 필요`,
  },
  {
    id: "5",
    title: "홈페이지 화면 구현",
    type: "DESIGN",
    typeNumber: 1,
    status: "REVIEW",
    priority: 8,
  },
  {
    id: "6",
    title: "홈페이지 화면 구현",
    type: "DESIGN",
    typeNumber: 1,
    status: "REVIEW",
    priority: 8,
  },
  {
    id: "7",
    title: "MCP 연동 완료",
    type: "DEV",
    typeNumber: 1,
    status: "DONE",
    priority: 8,
    content: `## MCP 연동 완료

### 구현 내용
- MCP 서버 연결 설정
- API 엔드포인트 구성
- 데이터 동기화 로직 구현

### 테스트 결과
- 모든 테스트 통과
- 성능 기준 충족
- 보안 검토 완료`,
  },
  {
    id: "8",
    title: "홈페이지 화면 구현",
    type: "DESIGN",
    typeNumber: 1,
    status: "DONE",
    priority: 8,
  },
];
