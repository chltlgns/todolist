"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Todo, PRIORITY_CONFIG } from "@/types";
import { TaskCard } from "@/components/dashboard/task-card";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { WorkHoursChart, StatsCardGrid } from "@/components/dashboard/work-hours-chart";
import { ProductivityComparison } from "@/components/dashboard/productivity-comparison";
import { AnnouncementBanner } from "@/components/announcements/announcement-banner";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface DailyChartData {
  label: string;
  hours: number;
  isToday?: boolean;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

export default function DashboardPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [userCoins, setUserCoins] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [todayWorkHours, setTodayWorkHours] = useState(0);
  const [todayCompletedTasks, setTodayCompletedTasks] = useState(0);
  const [weeklyWorkHours, setWeeklyWorkHours] = useState(0);
  const [monthlyWorkHours, setMonthlyWorkHours] = useState(0);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [monthlyCompleted, setMonthlyCompleted] = useState(0);
  const [dailyChartData, setDailyChartData] = useState<DailyChartData[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<DailyChartData[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<DailyChartData[]>([]);
  const supabase = createClient();
  const router = useRouter();

  const fetchTodos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

    let query = supabase
      .from("Todo")
      .select("*")
      .eq("userId", user.id)
      .eq("completed", false)
      .order("createdAt", { ascending: false });

    if (priorityFilter !== "ALL") {
      query = query.eq("priority", priorityFilter);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("할일 목록을 불러오는데 실패했습니다.");
      return;
    }
    setTodos(data || []);
  };

  const fetchUserCoins = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("User")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (data) {
      setUserCoins(data.coins);
    }
  };

  const fetchAllStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDay();
    const todayDate = today.getDate();

    // Get week start (Sunday)
    const weekStart = new Date(currentYear, currentMonth, todayDate - currentDay);
    const weekEnd = new Date(currentYear, currentMonth, todayDate + (6 - currentDay) + 1);

    // Get month start/end
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 1);

    // Get year start for monthly chart
    const yearStart = new Date(currentYear, 0, 1);

    // Fetch all completed todos for the year
    const { data: completedTodos } = await supabase
      .from("Todo")
      .select("*")
      .eq("userId", user.id)
      .eq("completed", true)
      .gte("startTime", yearStart.toISOString())
      .lt("startTime", new Date(currentYear + 1, 0, 1).toISOString());

    if (completedTodos) {
      let dailyHours = 0;
      let dailyCount = 0;
      let weekHours = 0;
      let weekCount = 0;
      let monthHours = 0;
      let monthCount = 0;

      // Initialize chart data
      const dailyData: number[] = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
      const weeklyData: number[] = [0, 0, 0, 0, 0]; // 5 weeks
      const monthlyData: number[] = new Array(12).fill(0);

      completedTodos.forEach((todo) => {
        if (todo.startTime && todo.endTime) {
          const todoDate = new Date(todo.startTime);
          const start = new Date(todo.startTime);
          const end = new Date(todo.endTime);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

          if (hours <= 0) return;

          // Monthly chart (by month of year)
          const todoMonth = todoDate.getMonth();
          monthlyData[todoMonth] += hours;

          // Check if in current month
          if (todoDate >= monthStart && todoDate < monthEnd) {
            monthHours += hours;
            monthCount++;

            // Weekly chart (by week of month) - calculate week number
            const weekOfMonth = Math.floor((todoDate.getDate() - 1) / 7);
            if (weekOfMonth < 5) {
              weeklyData[weekOfMonth] += hours;
            }
          }

          // Check if in current week
          if (todoDate >= weekStart && todoDate < weekEnd) {
            weekHours += hours;
            weekCount++;

            // Daily chart (by day of week)
            const dayOfWeek = todoDate.getDay();
            dailyData[dayOfWeek] += hours;
          }

          // Check if today
          const todoDateStr = todoDate.toISOString().split('T')[0];
          const todayStr = today.toISOString().split('T')[0];
          if (todoDateStr === todayStr) {
            dailyHours += hours;
            dailyCount++;
          }
        }
      });

      setTodayWorkHours(dailyHours);
      setTodayCompletedTasks(dailyCount);
      setWeeklyWorkHours(weekHours);
      setWeeklyCompleted(weekCount);
      setMonthlyWorkHours(monthHours);
      setMonthlyCompleted(monthCount);

      // Set chart data
      setDailyChartData(
        WEEKDAY_LABELS.map((label, index) => ({
          label,
          hours: dailyData[index],
          isToday: index === currentDay,
        }))
      );

      setWeeklyChartData(
        ["1주", "2주", "3주", "4주", "5주"].map((label, index) => ({
          label,
          hours: weeklyData[index],
          isToday: Math.floor((todayDate - 1) / 7) === index,
        }))
      );

      setMonthlyChartData(
        MONTH_LABELS.map((label, index) => ({
          label,
          hours: monthlyData[index],
          isToday: index === currentMonth,
        }))
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchTodos(), fetchUserCoins(), fetchAllStats()]);
      setLoading(false);
    };
    init();
  }, [priorityFilter]);

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
    setUserCoins((prev) => prev + coinReward);
    setTodos((prev) => prev.filter((t) => t.id !== todoId));

    // Refresh stats
    fetchAllStats();
  };

  const handleDelete = async (todoId: string) => {
    const { error } = await supabase
      .from("Todo")
      .delete()
      .eq("id", todoId);

    if (error) {
      toast.error("할일 삭제에 실패했습니다.");
      return;
    }

    toast.success("할일이 삭제되었습니다.");
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
  };

  const goToTodos = () => {
    router.push("/todos");
  };

  const completedTodayCount = todayCompletedTasks;
  const totalTodayCount = todos.length + todayCompletedTasks;
  const dailyGoal = 1000;

  return (
    <div className="flex flex-col gap-6">
      {/* Announcements */}
      <AnnouncementBanner />

      {/* Stats Cards */}
      <StatsCardGrid
        weeklyHours={weeklyWorkHours}
        weeklyCompleted={weeklyCompleted}
        monthlyHours={monthlyWorkHours}
        monthlyCompleted={monthlyCompleted}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <WorkHoursChart
          title="요일별 작업 시간 (이번 주)"
          data={dailyChartData}
          color="bg-primary/70"
        />
        <WorkHoursChart
          title="주별 작업 시간 (이번 달)"
          data={weeklyChartData}
          color="bg-blue-500/70"
        />
        <WorkHoursChart
          title="월별 작업 시간 (올해)"
          data={monthlyChartData}
          color="bg-orange-500/70"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Task Stream */}
        <section className="lg:col-span-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-3xl font-bold">오늘의 미션</h2>
              <p className="text-muted-foreground text-sm">
                할일을 완료하고 코인과 경험치를 얻으세요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="우선순위" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="URGENT">긴급</SelectItem>
                  <SelectItem value="HIGH">높음</SelectItem>
                  <SelectItem value="NORMAL">보통</SelectItem>
                  <SelectItem value="LOW">낮음</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={goToTodos}>
                <Plus className="h-4 w-4 mr-2" />
                새 미션
              </Button>
            </div>
          </div>

          {/* Task Cards */}
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                로딩 중...
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {priorityFilter === "ALL"
                    ? "아직 할일이 없습니다."
                    : `${PRIORITY_CONFIG[priorityFilter as keyof typeof PRIORITY_CONFIG]?.label || ""} 우선순위 할일이 없습니다.`}
                </p>
                <Button variant="outline" onClick={goToTodos}>
                  <Plus className="h-4 w-4 mr-2" />
                  미션 생성하기
                </Button>
              </div>
            ) : (
              todos.map((todo) => (
                <TaskCard
                  key={todo.id}
                  todo={todo}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </section>

        {/* Stats Panel */}
        <aside className="lg:col-span-4">
          <StatsPanel
            dailyEarned={userCoins}
            dailyGoal={dailyGoal}
            completionRate={
              totalTodayCount > 0
                ? Math.round((completedTodayCount / totalTodayCount) * 100)
                : 0
            }
            streak={3}
            todayWorkHours={todayWorkHours}
            todayCompletedTasks={todayCompletedTasks}
            weeklyWorkHours={weeklyWorkHours}
            monthlyWorkHours={monthlyWorkHours}
          />
        </aside>
      </div>
    </div>
  );
}
