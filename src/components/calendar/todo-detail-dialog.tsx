"use client";

import { Todo, PRIORITY_CONFIG } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Calendar,
  FolderOpen,
  CheckCircle2,
  Circle,
  FileText,
  AlertTriangle,
  Coins,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TodoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: Todo | null;
  onComplete?: (id: string, coinReward: number) => void;
  onEdit?: (todo: Todo) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function TodoDetailDialog({
  open,
  onOpenChange,
  todo,
  onComplete,
  onEdit,
}: TodoDetailDialogProps) {
  if (!todo) return null;

  const priorityConfig = PRIORITY_CONFIG[todo.priority];
  const workDate = todo.startTime ? new Date(todo.startTime) : null;
  const dayOfWeek = workDate ? WEEKDAYS[workDate.getDay()] : null;

  // Calculate remaining days from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todoDate = workDate ? new Date(workDate) : null;
  if (todoDate) todoDate.setHours(0, 0, 0, 0);
  const remainingDays = todoDate ? differenceInDays(todoDate, today) : null;

  // Calculate work hours
  const calculateWorkHours = () => {
    if (!todo.startTime || !todo.endTime) return null;
    const start = new Date(todo.startTime);
    const end = new Date(todo.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours > 0 ? hours : null;
  };
  const workHours = calculateWorkHours();

  const getRemainingDaysText = () => {
    if (remainingDays === null) return "날짜 없음";
    if (remainingDays === 0) return "오늘";
    if (remainingDays > 0) return `${remainingDays}일 남음`;
    return `${Math.abs(remainingDays)}일 지남`;
  };

  const getRemainingDaysColor = () => {
    if (remainingDays === null) return "text-muted-foreground";
    if (remainingDays < 0) return "text-red-500";
    if (remainingDays === 0) return "text-orange-500";
    if (remainingDays <= 3) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">
            {todo.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Remaining Days */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground w-28">
              <span className="text-lg font-mono">Σ</span>
              <span>남은 기간</span>
            </div>
            <span className={cn("font-medium", getRemainingDaysColor())}>
              {getRemainingDaysText()}
              {remainingDays !== null && remainingDays < 0 && (
                <span className="text-red-500 ml-1">!</span>
              )}
            </span>
          </div>

          {/* Description */}
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-2 text-muted-foreground w-28">
              <FileText className="h-4 w-4" />
              <span>메모</span>
            </div>
            <span className={cn(todo.description ? "" : "text-muted-foreground")}>
              {todo.description || "비어 있음"}
            </span>
          </div>

          {/* Work Date */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground w-28">
              <Calendar className="h-4 w-4" />
              <span>작업일</span>
            </div>
            <span>
              {workDate
                ? format(workDate, "yyyy년 M월 d일", { locale: ko })
                : "비어 있음"}
            </span>
          </div>

          {/* Work Time */}
          {todo.startTime && todo.endTime && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground w-28">
                <Clock className="h-4 w-4" />
                <span>작업 시간</span>
              </div>
              <span>
                {format(new Date(todo.startTime), "HH:mm")} -{" "}
                {format(new Date(todo.endTime), "HH:mm")}
                {workHours && (
                  <span className="text-primary ml-2">
                    ({workHours.toFixed(1)}시간)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Category */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground w-28">
              <FolderOpen className="h-4 w-4" />
              <span>분류</span>
            </div>
            {todo.category ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: todo.category.color }}
                />
                <span>{todo.category.name}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">비어 있음</span>
            )}
          </div>

          {/* Day of Week */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground w-28">
              <span className="text-lg font-mono">Σ</span>
              <span>요일</span>
            </div>
            <span>{dayOfWeek || "비어 있음"}</span>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground w-28">
              <AlertTriangle className="h-4 w-4" />
              <span>우선순위</span>
            </div>
            <Badge
              variant="secondary"
              className={cn(priorityConfig.color, priorityConfig.bgColor)}
            >
              {priorityConfig.label}
            </Badge>
          </div>

          {/* Coin Reward */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground w-28">
              <Coins className="h-4 w-4" />
              <span>보상</span>
            </div>
            <span className="text-yellow-500 font-semibold">
              {todo.coinReward} 코인
            </span>
          </div>

          {/* Completion Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground w-28">
              {todo.completed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span>진행상황</span>
            </div>
            {todo.completed ? (
              <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                완료
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                <Circle className="h-3 w-3 mr-1" />
                시작 전
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(todo)}>
              수정
            </Button>
          )}
          {!todo.completed && onComplete && (
            <Button onClick={() => onComplete(todo.id, todo.coinReward)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              완료하기
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
