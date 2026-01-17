"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DailyData {
  label: string;
  hours: number;
  isToday?: boolean;
}

interface WorkHoursChartProps {
  title: string;
  data: DailyData[];
  maxHours?: number;
  color?: string;
}

export function WorkHoursChart({
  title,
  data,
  maxHours,
  color = "bg-primary",
}: WorkHoursChartProps) {
  // Calculate max for scaling
  const actualMax = maxHours || Math.max(...data.map((d) => d.hours), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((item, index) => {
            const heightPercent = (item.hours / actualMax) * 100;
            return (
              <div
                key={index}
                className="flex flex-col items-center gap-1 flex-1"
              >
                {/* Bar */}
                <div className="w-full flex flex-col items-center justify-end h-24">
                  {item.hours > 0 && (
                    <span className="text-xs text-muted-foreground mb-1">
                      {item.hours.toFixed(1)}
                    </span>
                  )}
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t-sm transition-all",
                      item.isToday ? "bg-primary" : color,
                      item.hours === 0 && "bg-muted"
                    )}
                    style={{
                      height: item.hours > 0 ? `${Math.max(heightPercent, 5)}%` : "4px",
                    }}
                  />
                </div>
                {/* Label */}
                <span
                  className={cn(
                    "text-xs",
                    item.isToday
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardGridProps {
  weeklyHours: number;
  weeklyCompleted: number;
  monthlyHours: number;
  monthlyCompleted: number;
}

export function StatsCardGrid({
  weeklyHours,
  weeklyCompleted,
  monthlyHours,
  monthlyCompleted,
}: StatsCardGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            이번 주 작업 시간
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-primary">
            {weeklyHours.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              시간
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            이번 주 완료
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-500">
            {weeklyCompleted}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              건
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            이번 달 작업 시간
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-blue-500">
            {monthlyHours.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              시간
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            이번 달 완료
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-orange-500">
            {monthlyCompleted}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              건
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
