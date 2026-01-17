"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsOverview } from "@/components/admin/dashboard/stats-overview";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import type { AdminDashboardStats, AdminActivityLog } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient();

        // Fetch stats
        const [
          { count: totalUsers },
          { count: newUsersToday },
          { count: newUsersThisWeek },
          { count: totalTasks },
          { count: completedTasksToday },
          { data: usersWithCoins },
          { count: totalRewardsPurchased },
          { count: activeAnnouncements },
          { data: activityLogs },
        ] = await Promise.all([
          // Total users
          supabase.from("User").select("*", { count: "exact", head: true }),
          // New users today
          supabase
            .from("User")
            .select("*", { count: "exact", head: true })
            .gte("createdAt", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
          // New users this week
          supabase
            .from("User")
            .select("*", { count: "exact", head: true })
            .gte(
              "createdAt",
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            ),
          // Total tasks
          supabase.from("Todo").select("*", { count: "exact", head: true }),
          // Completed tasks today
          supabase
            .from("Todo")
            .select("*", { count: "exact", head: true })
            .eq("completed", true)
            .gte("updatedAt", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
          // Total coins in circulation
          supabase.from("User").select("coins"),
          // Total rewards purchased
          supabase.from("Purchase").select("*", { count: "exact", head: true }),
          // Active announcements
          supabase
            .from("Announcement")
            .select("*", { count: "exact", head: true })
            .eq("isActive", true),
          // Recent activity logs
          supabase
            .from("AdminActivityLog")
            .select("*, admin:User(email)")
            .order("createdAt", { ascending: false })
            .limit(10),
        ]);

        const totalCoins = usersWithCoins?.reduce((acc, user) => acc + (user.coins || 0), 0) || 0;

        setStats({
          totalUsers: totalUsers || 0,
          newUsersToday: newUsersToday || 0,
          newUsersThisWeek: newUsersThisWeek || 0,
          totalTasks: totalTasks || 0,
          completedTasksToday: completedTasksToday || 0,
          totalCoinsInCirculation: totalCoins,
          totalRewardsPurchased: totalRewardsPurchased || 0,
          activeAnnouncements: activeAnnouncements || 0,
        });

        setRecentLogs(activityLogs || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">서비스 현황을 한눈에 확인하세요.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">서비스 현황을 한눈에 확인하세요.</p>
      </div>

      {/* Stats Overview */}
      {stats && <StatsOverview stats={stats} />}

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity logs={recentLogs} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 관리 기능</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <QuickActionButton
              href="/admin/users"
              title="사용자 관리"
              description="사용자 목록 보기 및 관리"
            />
            <QuickActionButton
              href="/admin/rewards"
              title="보상 상품 추가"
              description="새로운 보상 상품 등록"
            />
            <QuickActionButton
              href="/admin/announcements"
              title="공지사항 작성"
              description="새 공지사항 등록"
            />
            <QuickActionButton
              href="/admin/reports"
              title="리포트 보기"
              description="상세 분석 데이터 확인"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionButton({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted transition-colors"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </a>
  );
}
