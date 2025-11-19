import { useState, useEffect, useRef } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, CheckCircle2, XCircle, Clock } from "lucide-react";
import TaskTag from "../TaskTag";
import type { Task } from "../../../../types/task";
import {
  listConnections,
  createSession,
  createRun,
  getRun,
  cancelRun,
  listRunEvents,
} from "../../../mcp/services/mcpService";
import type { Session, Run, RunEvent } from "../../../mcp/types";

interface TaskCommandViewProps {
  task: Task;
  projectId: string;
  onComplete: () => void;
  onLater: () => void;
}

export default function TaskCommandView({
  task,
  projectId,
  onComplete,
  onLater,
}: TaskCommandViewProps) {
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 연결 및 세션 초기화
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);
        // 프로젝트의 활성 연결 찾기
        const connections = await listConnections(projectId);
        const activeConnection = connections.find(
          (conn) => conn.status === "active",
        );

        if (!activeConnection) {
          toast({
            title: "활성 MCP 연결을 찾을 수 없습니다.",
            description: "프로젝트 설정에서 MCP 연결을 확인하세요.",
            variant: "destructive",
          });
          setIsInitializing(false);
          return;
        }

        // 세션 생성
        const newSession = await createSession({
          connectionId: activeConnection.connectionId,
          projectId: projectId,
          metadata: {
            taskId: task.id,
            taskCode: task.taskCode,
          },
        });
        setSession(newSession);
      } catch (error) {
        console.error("[TaskCommandView] 초기화 실패:", error);
        toast({
          title: "MCP 세션 초기화에 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();

    // 컴포넌트 언마운트 시 폴링 정리
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [projectId, task.id, task.taskCode, toast]);

  // 실행 상태 폴링
  useEffect(() => {
    if (!run || (run.status !== "pending" && run.status !== "running")) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updatedRun = await getRun(run.runId);
        setRun(updatedRun);

        // 이벤트 조회
        const runEvents = await listRunEvents(run.runId);
        setEvents(runEvents);

        // 완료 또는 실패 시 폴링 중지
        if (
          updatedRun.status === "completed" ||
          updatedRun.status === "failed" ||
          updatedRun.status === "cancelled"
        ) {
          clearInterval(interval);
          pollingIntervalRef.current = null;
        }
      } catch (error) {
        console.error("[TaskCommandView] 실행 상태 조회 실패:", error);
      }
    }, 2000); // 2초마다 폴링

    pollingIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      pollingIntervalRef.current = null;
    };
  }, [run]);

  const handleStartRun = async () => {
    if (!session) {
      toast({
        title: "세션이 준비되지 않았습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // 태스크 정보를 프롬프트로 변환
      const prompt = `프로젝트 ${projectId}의 태스크 ${task.taskCode || task.id}를 수행하세요.\n\n태스크 제목: ${task.title}\n태스크 내용: ${task.content || ""}`;

      const newRun = await createRun({
        sessionId: session.sessionId,
        prompt: prompt,
      });

      setRun(newRun);

      // 이벤트 조회 시작
      const runEvents = await listRunEvents(newRun.runId);
      setEvents(runEvents);

      toast({
        title: "실행이 시작되었습니다.",
        duration: 3000,
      });
    } catch (error) {
      console.error("[TaskCommandView] 실행 생성 실패:", error);
      toast({
        title: "실행 생성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRun = async () => {
    if (!run) return;

    try {
      setIsLoading(true);
      await cancelRun(run.runId);
      const updatedRun = await getRun(run.runId);
      setRun(updatedRun);
      toast({
        title: "실행이 취소되었습니다.",
        duration: 3000,
      });
    } catch (error) {
      console.error("[TaskCommandView] 실행 취소 실패:", error);
      toast({
        title: "실행 취소에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!run) return null;

    switch (run.status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "cancelled":
        return <X className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!run) return "대기 중";

    switch (run.status) {
      case "pending":
        return "대기 중";
      case "running":
        return "실행 중";
      case "completed":
        return "완료";
      case "failed":
        return "실패";
      case "cancelled":
        return "취소됨";
      default:
        return "알 수 없음";
    }
  };

  return (
    <>
      <DialogHeader className="px-6 pt-8 pb-2">
        <div className="mb-3">
          <TaskTag type={task.type} number={task.typeNumber} />
        </div>
        <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
      </DialogHeader>

      <div className="px-6 pb-6 flex flex-col min-h-[400px] space-y-6">
        {isInitializing ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <p className="text-gray-600">MCP 세션을 초기화하는 중...</p>
          </div>
        ) : !session ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <XCircle className="w-8 h-8 text-red-500" />
            <p className="text-gray-600 text-center">
              MCP 세션을 초기화할 수 없습니다.
              <br />
              프로젝트 설정에서 MCP 연결을 확인하세요.
            </p>
          </div>
        ) : (
          <>
            {/* 실행 상태 */}
            {run && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="font-semibold text-gray-900">
                      실행 상태: {getStatusText()}
                    </span>
                  </div>
                  {run.status === "running" && (
                    <Button
                      onClick={handleCancelRun}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      취소
                    </Button>
                  )}
                </div>
                {run.error && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {run.error}
                  </div>
                )}
                {run.result && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    실행 결과가 있습니다.
                  </div>
                )}
              </div>
            )}

            {/* 이벤트 로그 */}
            {events.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  실행 이벤트
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.eventId}
                      className="text-xs text-gray-600 p-2 bg-white rounded"
                    >
                      <span className="font-mono text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                      {" - "}
                      <span className="font-medium">{event.type}</span>
                      {event.data && (
                        <pre className="mt-1 text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 실행 시작 버튼 */}
            {!run && (
              <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                <p className="text-gray-600 text-center">
                  MCP를 통해 태스크를 실행하세요.
                </p>
                <Button
                  onClick={handleStartRun}
                  disabled={isLoading}
                  className="px-8 bg-black text-white hover:bg-black/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      실행 중...
                    </>
                  ) : (
                    "실행 시작"
                  )}
                </Button>
              </div>
            )}

            {/* 실행 완료 후 완료 버튼 */}
            {run &&
              (run.status === "completed" ||
                run.status === "failed" ||
                run.status === "cancelled") && (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-gray-600 text-center">
                    {run.status === "completed"
                      ? "실행이 완료되었습니다."
                      : run.status === "failed"
                        ? "실행이 실패했습니다."
                        : "실행이 취소되었습니다."}
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
        <Button onClick={onLater} variant="outline" className="px-8">
          이전
        </Button>
        <Button
          onClick={onComplete}
          disabled={
            isInitializing ||
            (run !== null &&
              run.status !== "completed" &&
              run.status !== "failed" &&
              run.status !== "cancelled")
          }
          className="px-8 bg-black text-white hover:bg-black/90"
        >
          완료
        </Button>
      </div>
    </>
  );
}
