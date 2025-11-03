import type { Task } from "../../../types/task";

export const mockTasks: Task[] = [
  // TODO - 3개
  {
    id: "1",
    title: "로그인 페이지 UI 구현",
    type: "DEV",
    typeNumber: 1,
    status: "TODO",
    priority: 9,
    taskCode: "T-001",
    content: `## 로그인 페이지 UI 구현

### 요구사항
- 이메일/비밀번호 입력 폼
- 소셜 로그인 버튼 (Google, Kakao)
- "비밀번호 찾기" 링크
- 반응형 디자인

### 구현 세부사항
- React Hook Form으로 폼 관리
- Tailwind CSS로 스타일링
- 입력 유효성 검사
- 로딩 상태 표시

### 테스트 전략
- 유효성 검사 테스트
- UI 컴포넌트 렌더링 테스트`,
  },
  {
    id: "2",
    title: "대시보드 디자인 시스템 구축",
    type: "DESIGN",
    typeNumber: 1,
    status: "TODO",
    priority: 8,
    taskCode: "T-002",
    content: `## 대시보드 디자인 시스템

### 디자인 가이드
- 컬러 팔레트 정의
- 타이포그래피 시스템
- 아이콘 세트 선정
- 버튼/입력 컴포넌트 디자인

### 주요 화면
- 대시보드 메인
- 통계 차트 영역
- 사이드바 네비게이션`,
  },
  {
    id: "3",
    title: "API 문서 작성",
    type: "DOCS",
    typeNumber: 1,
    status: "TODO",
    priority: 7,
    taskCode: "T-003",
    content: `## API 문서 작성

### 작성 내용
- REST API 엔드포인트 명세
- 요청/응답 예시
- 인증 방법 설명
- 에러 코드 정리

### 도구
- Swagger/OpenAPI 사용
- Postman 컬렉션 제공`,
  },

  // IN_PROGRESS - 2개
  {
    id: "4",
    title: "사용자 인증 API 구현",
    type: "DEV",
    typeNumber: 2,
    status: "IN_PROGRESS",
    priority: 10,
    taskCode: "T-004",
    content: `## 사용자 인증 API 구현

### 요구사항
- JWT 토큰 기반 인증
- 회원가입/로그인/로그아웃
- 토큰 갱신 기능
- 비밀번호 암호화

### 구현 세부사항
- bcrypt로 비밀번호 해싱
- JWT 토큰 발급 및 검증
- Refresh Token 관리
- Express 미들웨어 구현

### 진행 상황
- JWT 토큰 발급 완료
- 로그인 API 구현 중`,
  },
  {
    id: "5",
    title: "랜딩 페이지 디자인",
    type: "DESIGN",
    typeNumber: 2,
    status: "IN_PROGRESS",
    priority: 8,
    taskCode: "T-005",
    content: `## 랜딩 페이지 디자인

### 섹션 구성
- 히어로 섹션
- 주요 기능 소개
- 가격 정책
- CTA 버튼

### 진행 상황
- 히어로 섹션 시안 완료
- 나머지 섹션 작업 중`,
  },

  // REVIEW - 2개
  {
    id: "6",
    title: "Task 보드 드래그 앤 드롭 구현",
    type: "DEV",
    typeNumber: 3,
    status: "REVIEW",
    priority: 9,
    taskCode: "T-006",
    content: `## Task 보드 드래그 앤 드롭

### 완료 사항
- dnd-kit 라이브러리 적용
- 카드 드래그 기능 구현
- 컬럼 간 이동 구현
- 애니메이션 추가

### 리뷰 포인트
- 성능 최적화 확인
- 모바일 터치 동작 테스트
- 접근성 개선 필요`,
  },
  {
    id: "7",
    title: "프로젝트 README 작성",
    type: "DOCS",
    typeNumber: 2,
    status: "REVIEW",
    priority: 6,
    taskCode: "T-007",
    content: `## README 문서 작성

### 작성 내용
- 프로젝트 소개
- 설치 방법
- 실행 방법
- 기술 스택
- 기여 가이드

### 리뷰 포인트
- 설명 명확성 확인
- 예제 코드 검증`,
  },

  // DONE - 1개
  {
    id: "8",
    title: "프로젝트 초기 설정",
    type: "DEV",
    typeNumber: 4,
    status: "DONE",
    priority: 10,
    taskCode: "T-008",
    content: `## 프로젝트 초기 설정

### 완료 내용
- Vite + React + TypeScript 설정
- ESLint, Prettier 설정
- Tailwind CSS 설치
- 폴더 구조 구성
- Git 저장소 초기화

### 결과
- 모든 설정 완료
- 개발 환경 구축 완료`,
  },
];
