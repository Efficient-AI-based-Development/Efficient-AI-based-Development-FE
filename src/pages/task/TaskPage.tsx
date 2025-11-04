import { useState, useEffect } from "react";
import TaskHeader from "./components/TaskHeader";
import TaskBoard from "./components/TaskBoard";
import AddTaskModal from "./components/AddTaskModal";
import TaskDetailModal from "./components/TaskDetailModal/TaskDetailModal";
import type { Task, TaskType } from "../../types/task";

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 프로젝트 정보
  const PROJECT_ID = "4Y3M";

  // 태스크 목록 불러오기
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 태스크 상태 업데이트
  const handleTaskUpdate = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      // 낙관적 업데이트 (Optimistic Update)
      // 이동한 태스크를 해당 컬럼의 맨 끝에 추가
      setTasks((prevTasks) => {
        const targetTask = prevTasks.find((task) => task.id === taskId);
        if (!targetTask || targetTask.status === newStatus) {
          return prevTasks;
        }

        // 이동할 태스크를 제외한 나머지 태스크들
        const otherTasks = prevTasks.filter((task) => task.id !== taskId);

        // 이동한 태스크를 배열의 맨 끝에 추가
        return [...otherTasks, { ...targetTask, status: newStatus }];
      });

      // API 호출
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      // 에러 발생 시 다시 불러오기
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    }
  };

  // 태스크 추가 핸들러
  const handleAddTask = async (data: {
    type: TaskType;
    priority: number;
    message: string;
  }) => {
    try {
      // 새 태스크 생성
      const newTask: Task = {
        id: String(Date.now()), // 임시 ID 생성
        title: data.message.split("\n")[0] || "새로운 태스크",
        type: data.type,
        typeNumber: 1, // 타입별로 계산 필요
        status: "TODO",
        priority: data.priority,
      };

      // 낙관적 업데이트
      setTasks((prevTasks) => [...prevTasks, newTask]);

      // API 호출
      await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add task:", error);
      // 에러 발생 시 다시 불러오기
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    }
  };

  // 태스크 클릭 핸들러
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  // 태스크 내용 업데이트 핸들러
  const handleUpdateTaskContent = async (taskId: string, content: string) => {
    try {
      // 낙관적 업데이트
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, content } : task,
        ),
      );

      // selectedTask도 업데이트
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, content });
      }

      // API 호출
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error("Failed to update task content:", error);
      // 에러 발생 시 다시 불러오기
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    }
  };

  // 태스크 시작 (TODO → IN_PROGRESS)
  const handleStartTask = async (taskId: string) => {
    try {
      // 낙관적 업데이트
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, status: "IN_PROGRESS" as const }
            : task,
        ),
      );

      // API 호출
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });
    } catch (error) {
      console.error("Failed to start task:", error);
      // 에러 발생 시 다시 불러오기
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    }
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
      {/* 제목 및 인사이트 버튼 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-customBlack">
          종합설계프로젝트 1팀 의 대시보드
        </h1>
        <button className="px-6 py-2 bg-customBlack text-white rounded-lg hover:bg-opacity-90 transition-colors">
          인사이트 보기
        </button>
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
          projectId={PROJECT_ID}
          onUpdate={handleUpdateTaskContent}
          onStartTask={handleStartTask}
        />
      )}
    </div>
  );
}
