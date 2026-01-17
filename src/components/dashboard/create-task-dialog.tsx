"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Priority, Category } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Rocket, Coins, Clock, AlertTriangle, FolderOpen, Plus, X, ListChecks } from "lucide-react";
import { toast } from "sonner";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

const priorityOptions = [
  { value: "URGENT", label: "긴급 (Class S)", color: "text-red-500" },
  { value: "HIGH", label: "높음 (Class A)", color: "text-orange-500" },
  { value: "NORMAL", label: "보통 (Class B)", color: "text-blue-500" },
  { value: "LOW", label: "낮음 (Class C)", color: "text-gray-500" },
];

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "NORMAL" as Priority,
    categoryId: "",
    workDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    coinReward: 50,
  });

  // Calculate work hours
  const calculateWorkHours = () => {
    if (!formData.startTime || !formData.endTime) return null;
    const start = new Date(`2000-01-01T${formData.startTime}`);
    const end = new Date(`2000-01-01T${formData.endTime}`);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? diff : null;
  };

  const workHours = calculateWorkHours();

  // Fetch categories when dialog opens
  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("Category")
        .select("*")
        .eq("userId", user.id)
        .order("name", { ascending: true });

      if (data) {
        setCategories(data);
      }
    };

    if (open) {
      fetchCategories();
      // Reset form with today's date
      setFormData({
        title: "",
        description: "",
        priority: "NORMAL",
        categoryId: "",
        workDate: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        coinReward: 50,
      });
      setSubtasks([]);
      setNewSubtask("");
    }
  }, [open]);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error("시작 시간과 종료 시간을 입력해주세요.");
      return;
    }

    if (!workHours || workHours <= 0) {
      toast.error("종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      const startTime = new Date(`${formData.workDate}T${formData.startTime}`).toISOString();
      const endTime = new Date(`${formData.workDate}T${formData.endTime}`).toISOString();

      const { data: todoData, error } = await supabase.from("Todo").insert({
        userId: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        categoryId: formData.categoryId || null,
        startTime,
        endTime,
        coinReward: formData.coinReward,
        completed: false,
      }).select().single();

      if (error) {
        const errorMsg = error.message || error.code || JSON.stringify(error);
        toast.error(`할일 생성 실패: ${errorMsg}`);
        console.error("Supabase error:", error);
        return;
      }

      // Create subtasks if any
      if (subtasks.length > 0 && todoData) {
        const subtaskData = subtasks.map((title, index) => ({
          todoId: todoData.id,
          title,
          completed: false,
          order: index,
        }));

        const { error: subtaskError } = await supabase
          .from("Subtask")
          .insert(subtaskData);

        if (subtaskError) {
          console.error("Subtask creation error:", subtaskError);
        }
      }

      onTaskCreated();
    } catch (error) {
      toast.error("오류가 발생했습니다.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">새 미션 프로토콜</DialogTitle>
          <DialogDescription>
            할일을 생성하고 완료 시 코인을 획득하세요.
          </DialogDescription>
        </DialogHeader>

        <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">미션 목표</Label>
            <Input
              id="title"
              placeholder="예: 분기 보고서 작성"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">상세 내용</Label>
            <Textarea
              id="description"
              placeholder="세부 내용, 컨텍스트, 필요 사항 등..."
              className="min-h-[80px] resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <ListChecks className="h-3 w-3" /> 서브태스크
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="서브태스크 추가..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
              />
              <Button type="button" size="sm" variant="outline" onClick={addSubtask}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {subtasks.length > 0 && (
              <div className="space-y-1 mt-2">
                {subtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-1.5 rounded bg-muted/50 text-sm"
                  >
                    <span>{subtask}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSubtask(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid for fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Work Date */}
            <div className="space-y-2">
              <Label>작업 날짜</Label>
              <Input
                type="date"
                value={formData.workDate}
                onChange={(e) =>
                  setFormData({ ...formData, workDate: e.target.value })
                }
              />
            </div>

            {/* Work Hours Display */}
            <div className="space-y-2">
              <Label className="text-primary flex items-center gap-1">
                <Clock className="h-3 w-3" /> 작업 시간
              </Label>
              <div className="h-10 px-3 rounded-md border bg-muted/50 flex items-center">
                {workHours ? (
                  <span className="font-semibold text-primary">
                    {workHours.toFixed(1)}시간
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">
                    시간을 입력하세요
                  </span>
                )}
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <Label>시작 시간</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="time"
                  className="pl-10"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <Label>종료 시간</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="time"
                  className="pl-10"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>카테고리</Label>
              <div className="relative">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="카테고리 없음" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">카테고리 없음</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>우선순위</Label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className={opt.color}>{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Coin Reward */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-yellow-500 flex items-center gap-1">
                <Coins className="h-3 w-3" /> 보상
              </Label>
              <div className="relative max-w-[200px]">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500 pointer-events-none" />
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  className="pl-9 border-yellow-500/30 focus:border-yellow-500/50"
                  value={formData.coinReward}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coinReward: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-yellow-600 font-medium">
                  코인
                </span>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0 flex-shrink-0 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            취소
          </Button>
          <Button type="submit" form="create-task-form" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="h-4 w-4 mr-2" />
            )}
            미션 확정
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
