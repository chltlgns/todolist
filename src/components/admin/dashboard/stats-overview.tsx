"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, Coins, Gift, TrendingUp, Calendar, Megaphone, BarChart3 } from "lucide-react";
import type { AdminDashboardStats } from "@/types";

interface StatsOverviewProps {
  stats: AdminDashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: "전체 사용자",
      value: stats.totalUsers.toLocaleString(),
      description: `오늘 +${stats.newUsersToday}`,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "이번 주 신규",
      value: stats.newUsersThisWeek.toLocaleString(),
      description: "최근 7일",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "전체 할일",
      value: stats.totalTasks.toLocaleString(),
      description: `오늘 완료: ${stats.completedTasksToday}`,
      icon: CheckCircle2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "오늘 완료된 할일",
      value: stats.completedTasksToday.toLocaleString(),
      description: "오늘 완료",
      icon: Calendar,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "유통 코인",
      value: stats.totalCoinsInCirculation.toLocaleString(),
      description: "총 코인 보유량",
      icon: Coins,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "구매된 보상",
      value: stats.totalRewardsPurchased.toLocaleString(),
      description: "총 구매 수",
      icon: Gift,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "활성 공지",
      value: stats.activeAnnouncements.toLocaleString(),
      description: "현재 게시 중",
      icon: Megaphone,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "일일 완료율",
      value: stats.totalTasks > 0
        ? `${Math.round((stats.completedTasksToday / stats.totalTasks) * 100)}%`
        : "0%",
      description: "오늘의 달성률",
      icon: BarChart3,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
