# API 연결 가이드

## 📡 API 클라이언트 설정

프로젝트에서 백엔드 API와 통신하기 위한 axios 클라이언트가 설정되어 있습니다.

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_API_BASE_URL=http://34.61.144.150:8000
```

> **참고**: Vite에서는 환경 변수에 `VITE_` 접두사를 붙여야 클라이언트 코드에서 접근할 수 있습니다.

`.env.example` 파일이 있으니 참고하세요. 환경 변수가 설정되지 않은 경우 기본값(`http://34.61.144.150:8000`)이 사용됩니다.

## 🚀 사용 방법

### 1. 기본 사용법

`src/services/api.ts`에서 제공하는 `apiClient`를 import하여 사용합니다.

```typescript
import apiClient from "@/services/api";

// GET 요청
const fetchData = async () => {
  try {
    const response = await apiClient.get("/api/endpoint");
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// POST 요청
const createData = async (data: any) => {
  try {
    const response = await apiClient.post("/api/endpoint", data);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// PUT 요청
const updateData = async (id: string, data: any) => {
  try {
    const response = await apiClient.put(`/api/endpoint/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// DELETE 요청
const deleteData = async (id: string) => {
  try {
    const response = await apiClient.delete(`/api/endpoint/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
```

### 2. TanStack Query와 함께 사용

TanStack Query를 사용하여 서버 상태를 관리할 수 있습니다.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/services/api';

// Query 예시
function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      const response = await apiClient.get('/api/endpoint');
      return response.data;
    },
  });

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러 발생</div>;

  return <div>{JSON.stringify(data)}</div>;
}

// Mutation 예시
function CreateComponent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newData: any) => {
      const response = await apiClient.post('/api/endpoint', newData);
      return response.data;
    },
    onSuccess: () => {
      // 성공 시 캐시 무효화하여 데이터 재조회
      queryClient.invalidateQueries({ queryKey: ['myData'] });
    },
  });

  const handleSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <button onClick={() => handleSubmit({ name: 'test' })}>
      {mutation.isPending ? '생성 중...' : '생성하기'}
    </button>
  );
}
```

### 3. 커스텀 서비스 함수 생성

각 도메인별로 서비스 함수를 만들어 사용하는 것을 권장합니다.

```typescript
// src/pages/task/services/taskService.ts
import apiClient from "@/services/api";
import type { Task } from "@/types/task";

export const taskService = {
  // 태스크 목록 조회
  getTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get("/api/tasks");
    return response.data;
  },

  // 태스크 상세 조회
  getTask: async (id: string): Promise<Task> => {
    const response = await apiClient.get(`/api/tasks/${id}`);
    return response.data;
  },

  // 태스크 생성
  createTask: async (task: Partial<Task>): Promise<Task> => {
    const response = await apiClient.post("/api/tasks", task);
    return response.data;
  },

  // 태스크 수정
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    const response = await apiClient.patch(`/api/tasks/${id}`, task);
    return response.data;
  },

  // 태스크 삭제
  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/tasks/${id}`);
  },
};
```

그리고 컴포넌트에서 사용:

```typescript
import { useQuery } from "@tanstack/react-query";
import { taskService } from "@/pages/task/services/taskService";

function TaskList() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskService.getTasks,
  });

  // ...
}
```

## ⚙️ 설정 정보

- **Base URL**: 환경 변수 `VITE_API_BASE_URL`에서 가져옴 (기본값: `http://34.61.144.150:8000`)
- **Timeout**: 10초
- **Content-Type**: `application/json`

### 환경 변수 변경

다른 환경(개발/스테이징/프로덕션)에서 다른 API URL을 사용하려면:

1. `.env` 파일 수정
2. 또는 `.env.local`, `.env.development`, `.env.production` 파일 생성

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8000

# .env.production
VITE_API_BASE_URL=https://api.production.com
```

## 🔧 인터셉터

### 요청 인터셉터

요청 전에 공통 처리(인증 토큰 추가 등)를 수행할 수 있습니다.

```typescript
// src/services/api.ts에서 설정
apiClient.interceptors.request.use((config) => {
  // 인증 토큰 추가 예시
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 응답 인터셉터

응답 후 공통 처리(에러 처리 등)를 수행합니다.

현재 설정된 응답 인터셉터는:

- 서버 에러 응답 로깅
- 네트워크 에러 로깅
- 요청 설정 에러 로깅

## 📝 주의사항

1. **경로 설정**: `@/services/api`는 `vite.config.ts`에서 설정된 alias입니다.
2. **에러 처리**: 모든 API 호출은 try-catch로 감싸거나 TanStack Query의 에러 핸들링을 활용하세요.
3. **타입 안정성**: TypeScript를 사용하므로 응답 데이터의 타입을 정의하는 것을 권장합니다.

## 🔗 관련 파일

- `src/services/api.ts`: API 클라이언트 설정
- `vite.config.ts`: 경로 alias 설정 (`@` → `./src`)
