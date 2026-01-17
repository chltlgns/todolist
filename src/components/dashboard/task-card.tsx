"use client";

import { Todo, PRIORITY_CONFIG } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2, Clock, Coins, CheckCircle2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  todo: Todo;
  onComplete: (id: string, coinReward: number) => void;
  onDelete: (id: string) => void;
  onEdit?: (todo: Todo) => void;
}

const priorityColors: Record<string, string> = {
  URGENT: "border-l-red-500",
  HIGH: "border-l-orange-500",
  NORMAL: "border-l-blue-500",
  LOW: "border-l-gray-500",
};

// Calculate work hours from start and end time
const calculateWorkHours = (startTime: Date | string | null, endTime: Date | string | null) => {
  if (!startTime || !endTime) return null;
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return diff > 0 ? diff : null;
};

export function TaskCard({ todo, onComplete, onDelete, onEdit }: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[todo.priority];
  const hasTime = todo.startTime && todo.endTime;
  const isCompleted = todo.completed;
  const workHours = calculateWorkHours(todo.startTime, todo.endTime);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-l-4 transition-all",
        priorityColors[todo.priority],
        isCompleted ? "opacity-60" : "hover:-translate-y-0.5"
      )}
    >
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs uppercase tracking-wider",
                priorityConfig.color,
                priorityConfig.bgColor
              )}
            >
              {priorityConfig.label}
            </Badge>
            {hasTime && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                <Clock className="h-3 w-3" />
                {format(new Date(todo.startTime!), "HH:mm", { locale: ko })} -{" "}
                {format(new Date(todo.endTime!), "HH:mm", { locale: ko })}
              </div>
            )}
            {workHours && (
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                <Clock className="h-3 w-3 mr-1" />
                {workHours.toFixed(1)}시간
              </Badge>
            )}
            {todo.category && (
              <Badge variant="outline" className="text-xs">
                {todo.category.name}
              </Badge>
            )}
          </div>
          <div>
            <h3 className={cn("text-lg font-semibold", isCompleted && "line-through text-muted-foreground")}>
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Area */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              보상
            </span>
            <span className={cn("font-bold text-lg flex items-center gap-1", isCompleted ? "text-green-500" : "text-yellow-500")}>
              {isCompleted ? "" : "+"}{todo.coinReward}
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(todo)}
                className="text-muted-foreground hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(todo.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {isCompleted ? (
              <Button variant="secondary" disabled>
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                완료됨
              </Button>
            ) : (
              <Button onClick={() => onComplete(todo.id, todo.coinReward)}>
                <Check className="h-4 w-4 mr-2" />
                완료
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
