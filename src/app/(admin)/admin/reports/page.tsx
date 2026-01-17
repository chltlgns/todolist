"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, CheckSquare, Coins, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  totalTasks: number;
  completedTasks: number;
  totalCoins: number;
  totalPurchases: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalCoins: 0,
    totalPurchases: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from("User")
        .select("*", { count: "exact", head: true });

      // Get total tasks
      const { count: taskCount } = await supabase
        .from("Todo")
        .select("*", { count: "exact", head: true });

      // Get completed tasks
      const { count: completedCount } = await supabase
        .from("Todo")
        .select("*", { count: "exact", head: true })
        .eq("completed", true);

      // Get total coins in circulation
      const { data: coinData } = await supabase
        .from("User")
        .select("coins");
      const totalCoins = coinData?.reduce((sum, user) => sum + (user.coins || 0), 0) || 0;

      // Get total purchases
      const { count: purchaseCount } = await supabase
        .from("Purchase")
        .select("*", { count: "exact", head: true });

      setStats({
        totalUsers: userCount || 0,
        totalTasks: taskCount || 0,
        completedTasks: completedCount || 0,
        totalCoins,
        totalPurchases: purchaseCount || 0,
      });
    } catch (error) {
      toast.error("통계를 불러오는데 실패했습니다.");
      console.error(error);
    }
    setLoading(false);
  };

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">리포트 및 분석</h1>
        <p className="text-muted-foreground">서비스 전반의 통계를 확인합니다.</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">등록된 전체 사용자 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 할일</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                완료: {stats.completedTasks.toLocaleString()}개
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">완료율</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 코인</CardTitle>
              <Coins className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.totalCoins.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">유통 중인 전체 코인</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">총 구매</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPurchases.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">누적 보상 구매 횟수</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
