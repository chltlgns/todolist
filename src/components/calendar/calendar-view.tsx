"use client";

import { useState, useMemo } from "react";
import { Todo, PRIORITY_CONFIG } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Layers,
  List,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

type ViewMode = "week" | "month";

interface CalendarViewProps {
  todos: Todo[];
  onTodoClick: (todo: Todo) => void;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarView({ todos, onTodoClick }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  // Initialize with today's date at noon to avoid timezone issues
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  });

  // Get date range based on view mode
  const dateRange = useMemo(() => {
    // Create a clean date at noon to avoid timezone issues
    const baseDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 0, 0);

    if (viewMode === "week") {
      const start = startOfWeek(baseDate, { weekStartsOn: 0 });
      const end = endOfWeek(baseDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(baseDate);
      const end = endOfMonth(baseDate);
      // Include days from previous/next month to fill the calendar grid
      const calendarStart = startOfWeek(start, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(end, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }
  }, [viewMode, currentDate]);

  // Group todos by date
  const todosByDate = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};
    todos.forEach((todo) => {
      if (todo.startTime) {
        const dateKey = format(new Date(todo.startTime), "yyyy-MM-dd");
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(todo);
      }
    });
    return grouped;
  }, [todos]);

  // Calculate max todos in a single day for dynamic height
  const maxTodosInDay = useMemo(() => {
    let max = 0;
    dateRange.forEach((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const dayTodos = todosByDate[dateKey] || [];
      if (dayTodos.length > max) max = dayTodos.length;
    });
    return max;
  }, [dateRange, todosByDate]);

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "week") {
      setCurrentDate(
        direction === "prev"
          ? subWeeks(currentDate, 1)
          : addWeeks(currentDate, 1)
      );
    } else {
      setCurrentDate(
        direction === "prev"
          ? subMonths(currentDate, 1)
          : addMonths(currentDate, 1)
      );
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0));
  };

  // Calculate minimum height for cells based on max todos
  const getMinCellHeight = () => {
    const baseHeight = viewMode === "week" ? 120 : 100;
    const additionalHeight = Math.max(0, maxTodosInDay - 2) * 36;
    return baseHeight + additionalHeight;
  };

  const renderTodoItem = (todo: Todo) => {
    const priorityConfig = PRIORITY_CONFIG[todo.priority];

    return (
      <div
        key={todo.id}
        onClick={(e) => {
          e.stopPropagation();
          onTodoClick(todo);
        }}
        className={cn(
          "px-2 py-1.5 rounded-md cursor-pointer transition-all hover:opacity-80",
          "bg-card border text-sm truncate",
          todo.completed ? "opacity-70" : ""
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className="truncate flex-1 font-medium">{todo.title}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              todo.completed ? "bg-green-500" : "bg-yellow-500"
            )}
          />
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] px-1.5 py-0",
              todo.completed
                ? "bg-green-500/20 text-green-500"
                : "bg-yellow-500/20 text-yellow-500"
            )}
          >
            {todo.completed ? "완료" : "시작 전"}
          </Badge>
        </div>
      </div>
    );
  };

  const renderDayCell = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const dayTodos = todosByDate[dateKey] || [];
    const isCurrentMonth = isSameMonth(date, currentDate);
    const isDayToday = isToday(date);

    return (
      <div
        key={dateKey}
        className={cn(
          "border-r border-b p-2 flex flex-col",
          !isCurrentMonth && viewMode === "month" && "bg-muted/30",
          viewMode === "week" && "min-h-[200px]"
        )}
        style={{
          minHeight: viewMode === "month" ? `${getMinCellHeight()}px` : undefined,
        }}
      >
        {/* Date Header */}
        <div className="flex items-center justify-end mb-2">
          <span
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium",
              isDayToday && "bg-primary text-primary-foreground",
              !isCurrentMonth && viewMode === "month" && "text-muted-foreground"
            )}
          >
            {format(date, "d")}
          </span>
        </div>

        {/* Todos */}
        <div className="flex flex-col gap-1 flex-1 overflow-visible">
          {dayTodos.map((todo) => renderTodoItem(todo))}
        </div>
      </div>
    );
  };

  // For month view, group dates into weeks
  const weeks = useMemo(() => {
    if (viewMode === "week") return [dateRange];
    const result: Date[][] = [];
    for (let i = 0; i < dateRange.length; i += 7) {
      result.push(dateRange.slice(i, i + 7));
    }
    return result;
  }, [dateRange, viewMode]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "week" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="gap-1"
            >
              <Layers className="h-4 w-4" />
              주간
            </Button>
            <Button
              variant={viewMode === "month" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="gap-1"
            >
              <CalendarDays className="h-4 w-4" />
              월간
            </Button>
          </div>
        </div>

        {/* Current Date Display & Navigation */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold min-w-[140px] text-center">
            {format(currentDate, "yyyy년 M월", { locale: ko })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            오늘
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={cn(
                "py-3 text-center text-sm font-medium border-r last:border-r-0",
                index === 0 && "text-red-500",
                index === 6 && "text-blue-500"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Body */}
        <div className="flex flex-col">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7">
              {week.map((date) => renderDayCell(date))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
