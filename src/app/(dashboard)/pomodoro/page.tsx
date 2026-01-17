"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Todo, PRIORITY_CONFIG } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  CheckCircle2,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface TimerConfig {
  work: number;
  shortBreak: number;
  longBreak: number;
  sessionsUntilLongBreak: number;
}

const DEFAULT_CONFIG: TimerConfig = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsUntilLongBreak: 4,
};

const MODE_LABELS: Record<TimerMode, string> = {
  work: "집중 시간",
  shortBreak: "짧은 휴식",
  longBreak: "긴 휴식",
};

const MODE_COLORS: Record<TimerMode, string> = {
  work: "text-primary",
  shortBreak: "text-green-500",
  longBreak: "text-blue-500",
};

export default function PomodoroPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTodoId, setSelectedTodoId] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

  const [config] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(config.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalWorkMinutes, setTotalWorkMinutes] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchTodos();
    fetchTodaySessions();

    // Create audio element for notification sound
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/notification.mp3");
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const fetchTodos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    const { data } = await supabase
      .from("Todo")
      .select("*")
      .eq("userId", user.id)
      .eq("completed", false)
      .order("createdAt", { ascending: false });

    setTodos(data || []);
    setLoading(false);
  };

  const fetchTodaySessions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("PomodoroSession")
      .select("duration")
      .eq("userId", user.id)
      .gte("completedAt", today.toISOString());

    if (data) {
      const total = data.reduce((sum, session) => sum + session.duration, 0);
      setTotalWorkMinutes(total);
      setCompletedSessions(data.length);
    }
  };

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Audio play failed (likely no user interaction yet)
      });
    }
  }, [soundEnabled]);

  const sendBrowserNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/icon-192.png" });
    }
  }, []);

  const saveSession = async (duration: number) => {
    if (!userId) return;

    await supabase.from("PomodoroSession").insert({
      userId,
      todoId: selectedTodoId && selectedTodoId !== "none" ? selectedTodoId : null,
      duration,
      completedAt: new Date().toISOString(),
    });

    setTotalWorkMinutes((prev) => prev + duration);
    setCompletedSessions((prev) => prev + 1);
  };

  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);

    if (mode === "work") {
      // Save the pomodoro session
      await saveSession(config.work);

      playNotificationSound();
      sendBrowserNotification("포모도로 완료!", "휴식 시간입니다. 🎉");
      toast.success("집중 시간 완료! 휴식을 취하세요.");

      // Determine next break type
      const sessions = completedSessions + 1;
      if (sessions % config.sessionsUntilLongBreak === 0) {
        setMode("longBreak");
        setTimeLeft(config.longBreak * 60);
      } else {
        setMode("shortBreak");
        setTimeLeft(config.shortBreak * 60);
      }
    } else {
      playNotificationSound();
      sendBrowserNotification("휴식 종료!", "다시 집중할 시간입니다. 💪");
      toast.success("휴식 종료! 다시 집중하세요.");
      setMode("work");
      setTimeLeft(config.work * 60);
    }
  }, [mode, config, completedSessions, playNotificationSound, sendBrowserNotification]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, handleTimerComplete]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(config[mode] * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(config[newMode] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((config[mode] * 60 - timeLeft) / (config[mode] * 60)) * 100;

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast.success("알림이 활성화되었습니다!");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <section className="flex flex-col gap-2 pb-4 border-b">
        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          포모도로
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">집중 타이머</h1>
        <p className="text-muted-foreground text-sm">
          포모도로 기법으로 집중력을 높이세요.
        </p>
      </section>

      {/* Timer Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center gap-2 mb-4">
            {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => switchMode(m)}
                disabled={isRunning}
              >
                {m === "work" && <Brain className="h-4 w-4 mr-1" />}
                {m === "shortBreak" && <Coffee className="h-4 w-4 mr-1" />}
                {m === "longBreak" && <Coffee className="h-4 w-4 mr-1" />}
                {MODE_LABELS[m]}
              </Button>
            ))}
          </div>
          <CardTitle className={`text-7xl font-mono ${MODE_COLORS[mode]}`}>
            {formatTime(timeLeft)}
          </CardTitle>
          <CardDescription className="mt-2">
            {MODE_LABELS[mode]} - {config[mode]}분
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Progress value={progress} className="h-2" />

          {/* Task Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">연결할 할일 (선택)</label>
            <Select value={selectedTodoId} onValueChange={setSelectedTodoId}>
              <SelectTrigger>
                <SelectValue placeholder="할일 선택 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">없음</SelectItem>
                {todos.map((todo) => (
                  <SelectItem key={todo.id} value={todo.id}>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${PRIORITY_CONFIG[todo.priority].bgColor} ${PRIORITY_CONFIG[todo.priority].color} text-xs`}
                      >
                        {PRIORITY_CONFIG[todo.priority].label}
                      </Badge>
                      <span className="truncate max-w-[200px]">{todo.title}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant={isRunning ? "outline" : "default"}
              onClick={toggleTimer}
              className="w-32"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  일시정지
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  시작
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" onClick={resetTimer}>
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Notification Permission */}
          {"Notification" in (typeof window !== "undefined" ? window : {}) &&
            Notification.permission !== "granted" && (
              <div className="text-center">
                <Button variant="link" onClick={requestNotificationPermission}>
                  브라우저 알림 활성화하기
                </Button>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            오늘의 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary">
                {completedSessions}
              </div>
              <div className="text-sm text-muted-foreground">완료한 세션</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-3xl font-bold text-primary">
                {Math.floor(totalWorkMinutes / 60)}시간 {totalWorkMinutes % 60}분
              </div>
              <div className="text-sm text-muted-foreground">총 집중 시간</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            포모도로 기법이란?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>25분 동안 집중해서 작업합니다.</li>
            <li>타이머가 울리면 5분간 짧은 휴식을 취합니다.</li>
            <li>4번의 포모도로를 완료하면 15-30분간 긴 휴식을 취합니다.</li>
            <li>이 과정을 반복하여 생산성을 높입니다.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
