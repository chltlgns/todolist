"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Todo } from "@/types";
import { CalendarView } from "@/components/calendar/calendar-view";
import { TodoDetailDialog } from "@/components/calendar/todo-detail-dialog";
import { EditTaskDialog } from "@/components/dashboard/edit-task-dialog";
import { toast } from "sonner";

export default function CalendarPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTodos = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    // Fetch all todos with categories
    const { data, error } = await supabase
      .from("Todo")
      .select("*, category:Category(*)")
      .eq("userId", user.id)
      .order("startTime", { ascending: true });

    if (error) {
      toast.error("할일 목록을 불러오는데 실패했습니다.");
      console.error(error);
      return;
    }

    setTodos(data || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchTodos();
      setLoading(false);
    };
    init();
  }, []);

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailOpen(true);
  };

  const handleComplete = async (todoId: string, coinReward: number) => {
    const { error: updateError } = await supabase
      .from("Todo")
      .update({ completed: true })
      .eq("id", todoId);

    if (updateError) {
      toast.error("할일 완료 처리에 실패했습니다.");
      return;
    }

    // Update user coins
    const { data: userData } = await supabase
      .from("User")
      .select("coins")
      .eq("id", userId)
      .single();

    if (userData) {
      await supabase
        .from("User")
        .update({ coins: userData.coins + coinReward })
        .eq("id", userId);
    }

    toast.success(`할일 완료! +${coinReward} 코인 획득`);
    setIsDetailOpen(false);

    // Update local state
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, completed: true } : t))
    );
  };

  const handleEdit = (todo: Todo) => {
    setIsDetailOpen(false);
    setSelectedTodo(todo);
    setIsEditOpen(true);
  };

  const handleTaskUpdated = () => {
    setIsEditOpen(false);
    setSelectedTodo(null);
    fetchTodos();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col gap-2 pb-4 border-b">
        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          업무 목록
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">캘린더</h1>
        <p className="text-muted-foreground text-sm">
          주간 및 월간 단위로 할일을 확인하세요.
        </p>
      </section>

      {/* Calendar View */}
      <CalendarView todos={todos} onTodoClick={handleTodoClick} />

      {/* Todo Detail Dialog */}
      <TodoDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        todo={selectedTodo}
        onComplete={handleComplete}
        onEdit={handleEdit}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        todo={selectedTodo}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}
