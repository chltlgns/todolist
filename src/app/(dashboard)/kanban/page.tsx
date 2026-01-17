"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Todo, PRIORITY_CONFIG, KanbanStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Kanban,
  Clock,
  GripVertical,
  CheckCircle2,
  Circle,
  PlayCircle,
  Coins
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface KanbanColumn {
  id: KanbanStatus;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: "TODO", title: "할 일", icon: <Circle className="h-4 w-4" />, color: "bg-slate-500" },
  { id: "IN_PROGRESS", title: "진행 중", icon: <PlayCircle className="h-4 w-4" />, color: "bg-blue-500" },
  { id: "DONE", title: "완료", icon: <CheckCircle2 className="h-4 w-4" />, color: "bg-green-500" },
];

export default function KanbanPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data, error } = await supabase
      .from("Todo")
      .select("*, category:Category(*)")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      toast.error("할일 목록을 불러오는데 실패했습니다.");
      return;
    }

    // Map completed status to kanbanStatus if not set
    const mappedData = (data || []).map((todo) => ({
      ...todo,
      kanbanStatus: todo.kanbanStatus || (todo.completed ? "DONE" : "TODO"),
    }));

    setTodos(mappedData);
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, todo: Todo) => {
    setDraggedTodo(todo);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: KanbanStatus) => {
    e.preventDefault();

    if (!draggedTodo || draggedTodo.kanbanStatus === newStatus) {
      setDraggedTodo(null);
      return;
    }

    const completed = newStatus === "DONE";
    const previousStatus = draggedTodo.kanbanStatus;
    const wasCompleted = draggedTodo.completed;

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) =>
        t.id === draggedTodo.id
          ? { ...t, kanbanStatus: newStatus, completed }
          : t
      )
    );

    // Update in database
    const { error } = await supabase
      .from("Todo")
      .update({ kanbanStatus: newStatus, completed })
      .eq("id", draggedTodo.id);

    if (error) {
      // Rollback on error
      setTodos((prev) =>
        prev.map((t) =>
          t.id === draggedTodo.id
            ? { ...t, kanbanStatus: previousStatus as KanbanStatus, completed: wasCompleted }
            : t
        )
      );
      toast.error("상태 변경에 실패했습니다.");
    } else {
      // If moved to DONE and wasn't completed before, add coins
      if (newStatus === "DONE" && !wasCompleted && userId) {
        const { data: userData } = await supabase
          .from("User")
          .select("coins")
          .eq("id", userId)
          .single();

        if (userData) {
          await supabase
            .from("User")
            .update({ coins: userData.coins + draggedTodo.coinReward })
            .eq("id", userId);

          toast.success(`완료! +${draggedTodo.coinReward} 코인 획득`);
        }
      } else if (previousStatus === "DONE" && newStatus !== "DONE" && userId) {
        // If moved from DONE to other status, deduct coins
        const { data: userData } = await supabase
          .from("User")
          .select("coins")
          .eq("id", userId)
          .single();

        if (userData) {
          await supabase
            .from("User")
            .update({ coins: Math.max(0, userData.coins - draggedTodo.coinReward) })
            .eq("id", userId);

          toast.info(`완료 취소. -${draggedTodo.coinReward} 코인`);
        }
      } else {
        toast.success("상태가 변경되었습니다.");
      }
    }

    setDraggedTodo(null);
  };

  const getColumnTodos = (status: KanbanStatus) => {
    return todos.filter((todo) => (todo.kanbanStatus || (todo.completed ? "DONE" : "TODO")) === status);
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return null;
    return format(new Date(date), "HH:mm", { locale: ko });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col gap-2 pb-4 border-b">
        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          칸반 보드
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">작업 현황</h1>
        <p className="text-muted-foreground text-sm">
          드래그 앤 드롭으로 할일의 상태를 변경하세요.
        </p>
      </section>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => {
          const columnTodos = getColumnTodos(column.id);

          return (
            <div
              key={column.id}
              className="flex flex-col gap-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className={`p-1.5 rounded ${column.color} text-white`}>
                  {column.icon}
                </div>
                <span className="font-semibold">{column.title}</span>
                <Badge variant="secondary" className="ml-auto">
                  {columnTodos.length}
                </Badge>
              </div>

              {/* Column Content */}
              <div className="flex flex-col gap-2 min-h-[400px] p-2 rounded-lg border-2 border-dashed border-muted bg-muted/20">
                {columnTodos.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    할일을 드래그해서 놓으세요
                  </div>
                ) : (
                  columnTodos.map((todo) => {
                    const priorityConfig = PRIORITY_CONFIG[todo.priority];

                    return (
                      <Card
                        key={todo.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, todo)}
                        className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                          draggedTodo?.id === todo.id ? "opacity-50" : ""
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className={`${priorityConfig.bgColor} ${priorityConfig.color} text-xs`}
                                >
                                  {priorityConfig.label}
                                </Badge>
                                {todo.category && (
                                  <Badge
                                    variant="outline"
                                    style={{
                                      backgroundColor: `${todo.category.color}20`,
                                      color: todo.category.color,
                                      borderColor: `${todo.category.color}40`,
                                    }}
                                    className="text-xs"
                                  >
                                    {todo.category.name}
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium text-sm truncate">
                                {todo.title}
                              </h4>
                              {todo.description && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {todo.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                {todo.startTime && todo.endTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(todo.startTime)} - {formatTime(todo.endTime)}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Coins className="h-3 w-3 text-yellow-500" />
                                  {todo.coinReward}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
