"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { AdminActivityLog, AdminAction } from "@/types";

interface RecentActivityProps {
  logs: AdminActivityLog[];
}

const ACTION_LABELS: Record<AdminAction, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  USER_COIN_ADJUST: { label: "코인 조정", variant: "secondary" },
  USER_ROLE_CHANGE: { label: "역할 변경", variant: "default" },
  REWARD_CREATE: { label: "보상 생성", variant: "default" },
  REWARD_UPDATE: { label: "보상 수정", variant: "secondary" },
  REWARD_DELETE: { label: "보상 삭제", variant: "destructive" },
  ANNOUNCEMENT_CREATE: { label: "공지 생성", variant: "default" },
  ANNOUNCEMENT_UPDATE: { label: "공지 수정", variant: "secondary" },
  ANNOUNCEMENT_DELETE: { label: "공지 삭제", variant: "destructive" },
};

export function RecentActivity({ logs }: RecentActivityProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
          <CardDescription>관리자 활동 로그</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">아직 기록된 활동이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 활동</CardTitle>
        <CardDescription>관리자 활동 로그</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {logs.map((log) => {
              const actionInfo = ACTION_LABELS[log.action] || {
                label: log.action,
                variant: "outline" as const,
              };

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 pb-4 border-b last:border-0"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={actionInfo.variant}>{actionInfo.label}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">
                        {(log as any).admin?.email || "알 수 없음"}
                      </span>
                      님이{" "}
                      <span className="text-muted-foreground">
                        {log.targetType === "user" && "사용자"}
                        {log.targetType === "reward" && "보상"}
                        {log.targetType === "announcement" && "공지사항"}
                      </span>
                      에 대해 작업을 수행했습니다.
                    </p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
