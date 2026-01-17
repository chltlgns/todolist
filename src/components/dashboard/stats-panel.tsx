"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, TrendingUp, Flame, Lightbulb, ShoppingBag, Clock, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface StatsPanelProps {
  dailyEarned: number;
  dailyGoal: number;
  completionRate: number;
  streak: number;
  todayWorkHours: number;
  todayCompletedTasks: number;
  weeklyWorkHours: number;
  monthlyWorkHours: number;
}

export function StatsPanel({
  dailyEarned,
  dailyGoal,
  completionRate,
  streak,
  todayWorkHours,
  todayCompletedTasks,
  weeklyWorkHours,
  monthlyWorkHours,
}: StatsPanelProps) {
  const progress = Math.min((dailyEarned / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - dailyEarned, 0);

  return (
    <div className="flex flex-col gap-4 sticky top-20">
      <div className="flex items-center justify-between pb-2 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          커맨드 센터
        </h2>
      </div>

      {/* Daily Loot */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              일일 보상
            </CardTitle>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Coins className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {dailyEarned.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                / {dailyGoal.toLocaleString()}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              일일 보너스까지{" "}
              <span className="text-foreground font-semibold">
                {remaining.toLocaleString()} 코인
              </span>{" "}
              남음!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Work Hours */}
      <Card className="bg-gradient-to-b from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              오늘의 작업
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">
                {todayWorkHours.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">시간</span>
            </div>
            <p className="text-xs text-muted-foreground">
              오늘 완료한 할일{" "}
              <span className="text-foreground font-semibold">
                {todayCompletedTasks}개
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weekly & Monthly Work Hours */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              이번 주
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-500">
              {weeklyWorkHours.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                시간
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              이번 달
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-500">
              {monthlyWorkHours.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                시간
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion & Streak */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center gap-2">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-bold">{completionRate}%</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              완료율
            </span>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-b from-orange-500/5 to-transparent">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center gap-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/10 flex items-center justify-center text-orange-500 mb-2 ring-1 ring-orange-500/30">
              <Flame className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold">{streak}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              연속 달성
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Shop Highlights */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              상점 하이라이트
            </CardTitle>
            <Link
              href="/rewards"
              className="text-xs text-primary hover:underline"
            >
              상점 방문 →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-2 rounded-lg text-cyan-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div className="text-center">
                <span className="block text-xs text-muted-foreground">
                  테마
                </span>
                <span className="block text-sm font-semibold">네온 나이트</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
              >
                500 코인
              </Button>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-2 rounded-lg text-emerald-400">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-center">
                <span className="block text-xs text-muted-foreground">
                  뱃지
                </span>
                <span className="block text-sm font-semibold">프로 유저</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
              >
                1,200 코인
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pro Tip */}
      <Card className="border-l-4 border-l-primary bg-primary/5">
        <CardContent className="pt-4 flex gap-3 items-start">
          <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-semibold">프로 팁:</span> 긴급
            우선순위 할일을 5개 연속 완료하면 24시간 동안 "생산성 멀티플라이어"가
            활성화됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
