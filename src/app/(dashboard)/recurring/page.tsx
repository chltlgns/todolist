"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RecurringTask, Category, PRIORITY_CONFIG, RecurrenceType, Priority } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Repeat,
  Plus,
  Clock,
  Trash2,
  Edit2,
  Coins,
  Calendar,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const RECURRENCE_TYPES: { value: RecurrenceType; label: string }[] = [
  { value: "DAILY", label: "매일" },
  { value: "WEEKLY", label: "매주" },
  { value: "MONTHLY", label: "매월" },
];

export default function RecurringPage() {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "NORMAL" as Priority,
    categoryId: "",
    recurrenceType: "DAILY" as RecurrenceType,
    recurrenceDays: [] as number[],
    startTime: "09:00",
    endTime: "10:00",
    coinReward: 50,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [tasksResult, categoriesResult] = await Promise.all([
      supabase
        .from("RecurringTask")
        .select("*, category:Category(*)")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false }),
      supabase
        .from("Category")
        .select("*")
        .eq("userId", user.id),
    ]);

    if (tasksResult.data) setTasks(tasksResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "NORMAL",
      categoryId: "",
      recurrenceType: "DAILY",
      recurrenceDays: [],
      startTime: "09:00",
      endTime: "10:00",
      coinReward: 50,
    });
    setEditingTask(null);
  };

  const openEditDialog = (task: RecurringTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      categoryId: task.categoryId || "",
      recurrenceType: task.recurrenceType,
      recurrenceDays: task.recurrenceDays,
      startTime: task.startTime,
      endTime: task.endTime,
      coinReward: task.coinReward,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);

    const taskData = {
      userId: user.id,
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority,
      categoryId: formData.categoryId || null,
      recurrenceType: formData.recurrenceType,
      recurrenceDays: formData.recurrenceDays,
      startTime: formData.startTime,
      endTime: formData.endTime,
      coinReward: formData.coinReward,
    };

    try {
      if (editingTask) {
        const { error } = await supabase
          .from("RecurringTask")
          .update(taskData)
          .eq("id", editingTask.id);

        if (error) throw error;
        toast.success("반복 작업이 수정되었습니다.");
      } else {
        const { error } = await supabase
          .from("RecurringTask")
          .insert(taskData);

        if (error) throw error;
        toast.success("반복 작업이 생성되었습니다.");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("저장에 실패했습니다.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("RecurringTask")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("삭제에 실패했습니다.");
      return;
    }

    toast.success("반복 작업이 삭제되었습니다.");
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleActive = async (task: RecurringTask) => {
    const { error } = await supabase
      .from("RecurringTask")
      .update({ isActive: !task.isActive })
      .eq("id", task.id);

    if (error) {
      toast.error("상태 변경에 실패했습니다.");
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, isActive: !t.isActive } : t
      )
    );
    toast.success(task.isActive ? "비활성화되었습니다." : "활성화되었습니다.");
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter((d) => d !== day)
        : [...prev.recurrenceDays, day].sort(),
    }));
  };

  const getRecurrenceLabel = (task: RecurringTask) => {
    if (task.recurrenceType === "DAILY") return "매일";
    if (task.recurrenceType === "WEEKLY") {
      const days = task.recurrenceDays.map((d) => WEEKDAYS[d]).join(", ");
      return `매주 ${days}`;
    }
    if (task.recurrenceType === "MONTHLY") {
      const days = task.recurrenceDays.join(", ");
      return `매월 ${days}일`;
    }
    return "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col gap-2 pb-4 border-b">
        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          반복 작업
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">반복 작업 관리</h1>
            <p className="text-muted-foreground text-sm mt-1">
              매일, 매주, 매월 반복되는 작업을 설정하세요.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                반복 작업 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "반복 작업 수정" : "새 반복 작업"}
                </DialogTitle>
                <DialogDescription>
                  반복 작업의 상세 정보를 입력하세요.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="작업 제목"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="작업 설명 (선택)"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>우선순위</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Priority) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">없음</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>반복 유형</Label>
                  <Select
                    value={formData.recurrenceType}
                    onValueChange={(value: RecurrenceType) =>
                      setFormData({
                        ...formData,
                        recurrenceType: value,
                        recurrenceDays: [],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RECURRENCE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrenceType === "WEEKLY" && (
                  <div className="space-y-2">
                    <Label>반복 요일</Label>
                    <div className="flex gap-1">
                      {WEEKDAYS.map((day, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={
                            formData.recurrenceDays.includes(index)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="w-9 h-9 p-0"
                          onClick={() => toggleDay(index)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.recurrenceType === "MONTHLY" && (
                  <div className="space-y-2">
                    <Label>반복 일자</Label>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={
                            formData.recurrenceDays.includes(day)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          className="w-9 h-9 p-0 text-xs"
                          onClick={() => toggleDay(day)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">시작 시간</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">종료 시간</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coinReward">코인 보상</Label>
                  <Input
                    id="coinReward"
                    type="number"
                    min={0}
                    value={formData.coinReward}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coinReward: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  {editingTask ? "수정" : "생성"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Task List */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              아직 반복 작업이 없습니다.
              <br />
              새 반복 작업을 추가해보세요.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const priorityConfig = PRIORITY_CONFIG[task.priority];

            return (
              <Card
                key={task.id}
                className={`transition-opacity ${
                  !task.isActive ? "opacity-60" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${priorityConfig.bgColor} ${priorityConfig.color}`}
                      >
                        {priorityConfig.label}
                      </Badge>
                      {task.category && (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: `${task.category.color}20`,
                            color: task.category.color,
                            borderColor: `${task.category.color}40`,
                          }}
                        >
                          {task.category.name}
                        </Badge>
                      )}
                    </div>
                    <Switch
                      checked={task.isActive}
                      onCheckedChange={() => toggleActive(task)}
                    />
                  </div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  {task.description && (
                    <CardDescription className="line-clamp-2">
                      {task.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{getRecurrenceLabel(task)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {task.startTime} - {task.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span>{task.coinReward} 코인</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(task)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
