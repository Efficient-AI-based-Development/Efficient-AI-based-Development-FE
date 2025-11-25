import { useState, useEffect } from "react";
import { useRouter, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import TaskHeader from "./components/TaskHeader";
import TaskBoard from "./components/TaskBoard";
import AddTaskModal from "./components/AddTaskModal";
import TaskDetailModal from "./components/TaskDetailModal/TaskDetailModal";
import type { Task, TaskType } from "../../types/task";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  mapApiTaskToTask,
} from "./services/taskService";

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const search = useSearch({ from: "/task" });

  const DEFAULT_PROJECT_ID = 1;
  const parsedProjectId = search.projectId
    ? Number(search.projectId)
    : DEFAULT_PROJECT_ID;

  // 프로젝트 정보
  const PROJECT_ID = Number.isNaN(parsedProjectId)
    ? DEFAULT_PROJECT_ID
    : parsedProjectId;

  // 태스크 목록 불러오기
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks(PROJECT_ID);

        // API 응답을 Task 형식으로 변환
        const tasks = response.data.map(mapApiTaskToTask);

        setTasks(tasks);
      } catch (error) {
        // 에러 처리 - 조용히 실패 (초기 로딩 시)
        if (import.meta.env.DEV) {
          console.error("태스크 목록 조회 실패:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [PROJECT_ID]);

  // URL 쿼리로 진입 시 추가 모달 자동 오픈 (?new=1)
  useEffect(() => {
    if (search.new) {
      setIsModalOpen(true);
    }
  }, [search.new]);

  // 태스크 상태 업데이트
  const handleTaskUpdate = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      const taskIdNum = Number(taskId);
      if (isNaN(taskIdNum)) {
        return;
      }

      // 낙관적 업데이트 (Optimistic Update)
      setTasks((prevTasks) => {
        const targetTask = prevTasks.find((task) => task.id === taskId);
        if (!targetTask || targetTask.status === newStatus) {
          return prevTasks;
        }
        const otherTasks = prevTasks.filter((task) => task.id !== taskId);
        return [...otherTasks, { ...targetTask, status: newStatus }];
      });

      // API 호출
      const response = await updateTask(taskIdNum, { status: newStatus });

      // API 응답으로 업데이트
      const updatedTask = mapApiTaskToTask(response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );
    } catch (error) {
      // 에러 발생 시 다시 불러오기
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패 - 상태 롤백
        if (import.meta.env.DEV) {
          console.error(
            "태스크 상태 업데이트 및 재조회 실패:",
            error,
            fetchError,
          );
        }
      }
    }
  };

  // 태스크 추가 핸들러
  const handleAddTask = async (data: {
    type: TaskType;
    priority: number;
    message: string;
  }) => {
    try {
      // 메시지에서 title과 description 추출
      const messageLines = data.message
        .split("\n")
        .filter((line) => line.trim());
      const title = messageLines[0] || "새로운 태스크";
      const description = data.message;

      // API 호출
      const response = await createTask(PROJECT_ID, {
        title,
        description,
        description_md: description,
        type: data.type,
        priority: data.priority,
      });

      // API 응답을 Task 형식으로 변환
      const newTask: Task = {
        id: String(response.data.id),
        title: response.data.title,
        type: data.type, // API 응답의 type은 "feat"이지만, 프론트엔드에서는 "DEV" 사용
        typeNumber: 1, // TODO: 타입별로 계산 필요
        status: "TODO", // API 응답의 status는 "todo"이지만, 프론트엔드에서는 "TODO" 사용
        priority: response.data.priority,
        content: response.data.description_md,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at,
      };

      // 성공 시 태스크 목록에 추가
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setIsModalOpen(false);
    } catch (error) {
      // 에러 발생 시 다시 불러오기
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패
        if (import.meta.env.DEV) {
          console.error("태스크 추가 및 재조회 실패:", error, fetchError);
        }
      }
    }
  };

  // 태스크 클릭 핸들러
  const handleTaskClick = async (task: Task) => {
    try {
      // API에서 최신 태스크 정보 가져오기
      const taskId = Number(task.id);
      if (isNaN(taskId)) {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
        return;
      }

      const response = await getTask(taskId);

      // API 응답을 Task 형식으로 변환
      const updatedTask = mapApiTaskToTask(response.data);

      setSelectedTask(updatedTask);
      setIsDetailModalOpen(true);
    } catch (error) {
      // 에러 발생 시 기존 task 데이터 사용
      if (import.meta.env.DEV) {
        console.error("태스크 상세 조회 실패:", error);
      }
      setSelectedTask(task);
      setIsDetailModalOpen(true);
    }
  };

  // 태스크 내용 업데이트 핸들러
  const handleUpdateTaskContent = async (taskId: string, content: string) => {
    try {
      const taskIdNum = Number(taskId);
      if (isNaN(taskIdNum)) {
        return;
      }

      // 낙관적 업데이트
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, content } : task,
        ),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, content });
      }

      // API 호출
      const response = await updateTask(taskIdNum, {
        description_md: content,
        description: content,
      });

      // API 응답으로 업데이트
      const updatedTask = mapApiTaskToTask(response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패
        if (import.meta.env.DEV) {
          console.error(
            "태스크 내용 업데이트 및 재조회 실패:",
            error,
            fetchError,
          );
        }
      }
    }
  };

  // 태스크 타입 업데이트 핸들러
  const handleUpdateTaskType = async (taskId: string, type: TaskType) => {
    try {
      const taskIdNum = Number(taskId);
      if (isNaN(taskIdNum)) {
        return;
      }

      // 낙관적 업데이트
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, type } : task,
        ),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, type });
      }

      // API 호출
      const response = await updateTask(taskIdNum, { type });

      // API 응답으로 업데이트
      const updatedTask = mapApiTaskToTask(response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패
        if (import.meta.env.DEV) {
          console.error(
            "태스크 타입 업데이트 및 재조회 실패:",
            error,
            fetchError,
          );
        }
      }
    }
  };

  // 태스크 중요도 업데이트 핸들러
  const handleUpdateTaskPriority = async (taskId: string, priority: number) => {
    try {
      const taskIdNum = Number(taskId);
      if (isNaN(taskIdNum)) {
        return;
      }

      // 낙관적 업데이트
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, priority } : task,
        ),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, priority });
      }

      // API 호출
      const response = await updateTask(taskIdNum, { priority });

      // API 응답으로 업데이트
      const updatedTask = mapApiTaskToTask(response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패
        if (import.meta.env.DEV) {
          console.error(
            "태스크 중요도 업데이트 및 재조회 실패:",
            error,
            fetchError,
          );
        }
      }
    }
  };

  // 태스크 시작 (TODO → IN_PROGRESS)
  const handleStartTask = async (taskId: string) => {
    try {
      const taskIdNum = Number(taskId);
      if (isNaN(taskIdNum)) {
        return;
      }

      // 낙관적 업데이트
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, status: "IN_PROGRESS" as const }
            : task,
        ),
      );

      // API 호출
      const response = await updateTask(taskIdNum, { status: "IN_PROGRESS" });

      // API 응답으로 업데이트
      const updatedTask = mapApiTaskToTask(response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );
    } catch (error) {
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패
        if (import.meta.env.DEV) {
          console.error("태스크 시작 및 재조회 실패:", error, fetchError);
        }
      }
    }
  };

  // 태스크 삭제 핸들러
  const handleDeleteTask = async (taskId: string) => {
    try {
      const taskIdNum = Number(taskId);
      if (isNaN(taskIdNum)) {
        return;
      }

      // 낙관적 업데이트
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

      // selectedTask도 초기화
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
        setIsDetailModalOpen(false);
      }

      // API 호출
      await deleteTask(taskIdNum);
    } catch (error) {
      // 에러 발생 시 다시 불러오기
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패
        if (import.meta.env.DEV) {
          console.error("태스크 거절 및 재조회 실패:", error, fetchError);
        }
      }
    }
  };

  // REVIEW 상태 거절 핸들러 (REVIEW → TODO)
  const handleRejectTask = async (taskId: string) => {
    try {
      const taskIdNum = Number(taskId);
      if (isNaN(taskIdNum)) {
        return;
      }

      // 낙관적 업데이트
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: "TODO" as const } : task,
        ),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: "TODO" });
      }

      // API 호출
      const response = await updateTask(taskIdNum, { status: "TODO" });

      // API 응답으로 업데이트
      const updatedTask = mapApiTaskToTask(response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패
        if (import.meta.env.DEV) {
          console.error("태스크 승인 및 재조회 실패:", error, fetchError);
        }
      }
    }
  };

  // REVIEW 상태 수락 핸들러 (REVIEW → DONE)
  const handleApproveTask = async (taskId: string) => {
    try {
      const taskIdNum = Number(taskId);
      if (isNaN(taskIdNum)) {
        return;
      }

      // 낙관적 업데이트
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: "DONE" as const } : task,
        ),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: "DONE" });
      }

      // API 호출
      const response = await updateTask(taskIdNum, { status: "DONE" });

      // API 응답으로 업데이트
      const updatedTask = mapApiTaskToTask(response.data);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );

      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      try {
        const response = await getTasks(PROJECT_ID);
        const tasks = response.data.map(mapApiTaskToTask);
        setTasks(tasks);
      } catch (fetchError) {
        // 재조회 실패
        if (import.meta.env.DEV) {
          console.error("태스크 승인 및 재조회 실패:", error, fetchError);
        }
      }
    }
  };

  // 추가하기 핸들러 (태스크 추가 모달 열기)
  const handleAddMore = () => {
    setIsDetailModalOpen(false);
    setIsModalOpen(true);
  };

  // 검색 필터링
  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const title = task.title.toLowerCase();
    const taskCode = `${task.type}-${task.typeNumber}`.toLowerCase();

    return title.includes(query) || taskCode.includes(query);
  });

  // 통계 계산
  const stats = {
    totalTasks: tasks.length,
    completionRate: tasks.length
      ? Math.round(
          (tasks.filter((task) => task.status === "DONE").length /
            tasks.length) *
            100,
        )
      : 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* 제목 + MCP 연동 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-customBlack">
          종합설계프로젝트 1팀 의 대시보드
        </h1>
        <Button
          className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-2"
          onClick={() => router.navigate({ to: "/mcp" })}
        >
          MCP 연동
        </Button>
      </div>

      {/* 검색바 + 통계 + 컬럼 테두리 박스 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {/* 검색바 + 통계 */}
        <div className="mb-6">
          <TaskHeader
            stats={stats}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* 태스크 보드 */}
        <TaskBoard
          tasks={filteredTasks}
          onTaskUpdate={handleTaskUpdate}
          onAddTask={() => setIsModalOpen(true)}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* 태스크 추가 모달 */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />

      {/* 태스크 상세 모달 */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          task={selectedTask}
          projectId={String(PROJECT_ID)}
          onUpdate={handleUpdateTaskContent}
          onUpdateType={handleUpdateTaskType}
          onUpdatePriority={handleUpdateTaskPriority}
          onStartTask={handleStartTask}
          onDelete={handleDeleteTask}
          onReject={handleRejectTask}
          onApprove={handleApproveTask}
          onAddMore={handleAddMore}
        />
      )}
    </div>
  );
}
