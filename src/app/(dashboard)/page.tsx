"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Todo } from "@/types";
import { WorkHoursChart, StatsCardGrid } from "@/components/dashboard/work-hours-chart";
import { AnnouncementBanner } from "@/components/announcements/announcement-banner";
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
  const [todayCompletedTasks, setTodayCompletedTasks] = useState(0);
  const [weeklyWorkHours, setWeeklyWorkHours] = useState(0);
  const [monthlyWorkHours, setMonthlyWorkHours] = useState(0);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [monthlyCompleted, setMonthlyCompleted] = useState(0);
  const [dailyChartData, setDailyChartData] = useState<DailyChartData[]>([]);
  const [weeklyChartData, setWeeklyChartData] = useState<DailyChartData[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<DailyChartData[]>([]);
  const [totalCompletedTasks, setTotalCompletedTasks] = useState(0);
  const [totalAllTasks, setTotalAllTasks] = useState(0);
  const supabase = createClient();

  // Calculate cumulative rate
  const cumulativeRate = totalAllTasks > 0 ? Math.round((totalCompletedTasks / totalAllTasks) * 100) : 0;

  const fetchTodos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("Todo")
      .select("*")
      .eq("userId", user.id)
      .eq("completed", false)
      .order("createdAt", { ascending: false });

    if (error) {
      toast.error("할일 목록을 불러오는데 실패했습니다.");
      return;
    }
    setTodos(data || []);
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

    // Fetch cumulative task counts (all time)
    const { count: allTasksCount } = await supabase
      .from("Todo")
      .select("*", { count: "exact", head: true })
      .eq("userId", user.id);

    const { count: completedTasksCount } = await supabase
      .from("Todo")
      .select("*", { count: "exact", head: true })
      .eq("userId", user.id)
      .eq("completed", true);

    setTotalAllTasks(allTasksCount || 0);
    setTotalCompletedTasks(completedTasksCount || 0);

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
      await Promise.all([fetchTodos(), fetchAllStats()]);
      setLoading(false);
    };
    init();
  }, []);

  const completedTodayCount = todayCompletedTasks;
  const totalTodayCount = todos.length + todayCompletedTasks;

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

      {/* Completion Rate Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Completion Rate */}
        <div className="bg-card border rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
          <h3 className="text-lg font-semibold text-muted-foreground">오늘의 완료율</h3>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted/30"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0}, 100`}
                strokeLinecap="round"
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">
                {totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            완료 <span className="text-foreground font-semibold">{completedTodayCount}</span> / 전체 <span className="text-foreground font-semibold">{totalTodayCount}</span>
          </p>
        </div>

        {/* Cumulative Completion Rate */}
        <div className="bg-card border rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
          <h3 className="text-lg font-semibold text-muted-foreground">누적 완료율</h3>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted/30"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={`${cumulativeRate}, 100`}
                strokeLinecap="round"
                className="text-green-500 transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-green-500">
                {cumulativeRate}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            완료 <span className="text-foreground font-semibold">{totalCompletedTasks}</span> / 전체 <span className="text-foreground font-semibold">{totalAllTasks}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
