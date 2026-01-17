"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Todo, PRIORITY_CONFIG, Priority } from "@/types";
import { TaskCard } from "@/components/dashboard/task-card";
import { CreateTaskDialog } from "@/components/dashboard/create-task-dialog";
import { EditTaskDialog } from "@/components/dashboard/edit-task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  ListTodo,
  CheckCircle2,
  Circle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

type StatusFilter = "ALL" | "ACTIVE" | "COMPLETED";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTodos = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    let query = supabase
      .from("Todo")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (statusFilter === "ACTIVE") {
      query = query.eq("completed", false);
    } else if (statusFilter === "COMPLETED") {
      query = query.eq("completed", true);
    }

    if (priorityFilter !== "ALL") {
      query = query.eq("priority", priorityFilter);
    }

    const { data, error } = await query;
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
  }, [statusFilter, priorityFilter]);

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

    // Update local state
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, completed: true } : t))
    );
  };

  const handleDelete = async (todoId: string) => {
    const { error } = await supabase.from("Todo").delete().eq("id", todoId);

    if (error) {
      toast.error("할일 삭제에 실패했습니다.");
      return;
    }

    toast.success("할일이 삭제되었습니다.");
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  const handleTaskCreated = () => {
    setIsCreateOpen(false);
    fetchTodos();
    toast.success("새 할일이 생성되었습니다!");
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditOpen(true);
  };

  const handleTaskUpdated = () => {
    setIsEditOpen(false);
    setEditingTodo(null);
    fetchTodos();
  };

  // Filter by search query
  const filteredTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            할일 관리
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">모든 할일</h1>
            <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              새 할일
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            전체 {todos.length}개 · 진행 중 {activeTodos.length}개 · 완료{" "}
            {completedTodos.length}개
          </p>
        </div>

        {/* Status Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="ALL" className="gap-1">
              <ListTodo className="h-4 w-4" />
              전체
            </TabsTrigger>
            <TabsTrigger value="ACTIVE" className="gap-1">
              <Circle className="h-4 w-4" />
              진행 중
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="gap-1">
              <CheckCircle2 className="h-4 w-4" />
              완료
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Filter Toolbar */}
      <section className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-xl border">
        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="우선순위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 우선순위</SelectItem>
              <SelectItem value="URGENT">
                <span className="text-red-500">긴급 (Class S)</span>
              </SelectItem>
              <SelectItem value="HIGH">
                <span className="text-orange-500">높음 (Class A)</span>
              </SelectItem>
              <SelectItem value="NORMAL">
                <span className="text-blue-500">보통 (Class B)</span>
              </SelectItem>
              <SelectItem value="LOW">
                <span className="text-gray-500">낮음 (Class C)</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="할일 검색..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Todo List */}
      <section className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            로딩 중...
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "검색 결과가 없습니다."
                : statusFilter === "COMPLETED"
                ? "완료된 할일이 없습니다."
                : statusFilter === "ACTIVE"
                ? "진행 중인 할일이 없습니다."
                : "아직 할일이 없습니다."}
            </p>
            {!searchQuery && statusFilter !== "COMPLETED" && (
              <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                할일 생성하기
              </Button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TaskCard
              key={todo.id}
              todo={todo}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </section>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onTaskCreated={handleTaskCreated}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        todo={editingTodo}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}
