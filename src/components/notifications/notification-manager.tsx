"use client";

import { useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";

interface NotificationManagerProps {
  userId: string;
}

export function NotificationManager({ userId }: NotificationManagerProps) {
  const notifiedTodos = useRef<Set<string>>(new Set());

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }, []);

  const showNotification = useCallback((title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
    toast.warning(title, { description: body });
  }, []);

  const checkNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/todos/notifications?userId=${userId}`);
      if (!response.ok) return;

      const todos = await response.json();
      const now = new Date();

      for (const todo of todos) {
        if (notifiedTodos.current.has(todo.id)) continue;

        const endTime = new Date(todo.endTime);
        const notifyMinutes = todo.notifyBefore || 10;
        const notifyTime = new Date(endTime.getTime() - notifyMinutes * 60 * 1000);

        if (now >= notifyTime && now < endTime && !todo.completed) {
          const minutesLeft = Math.ceil((endTime.getTime() - now.getTime()) / 60000);
          showNotification(
            `할일 마감 임박: ${todo.title}`,
            `${minutesLeft}분 후에 마감됩니다. 코인 보상: ${todo.coinReward}`
          );
          notifiedTodos.current.add(todo.id);

          // 알림 전송 기록
          await fetch(`/api/todos/${todo.id}/notified`, { method: "POST" });
        }
      }
    } catch (error) {
      console.error("Failed to check notifications:", error);
    }
  }, [userId, showNotification]);

  useEffect(() => {
    requestNotificationPermission();

    // 30초마다 알림 체크
    const interval = setInterval(checkNotifications, 30000);
    checkNotifications(); // 초기 체크

    return () => clearInterval(interval);
  }, [checkNotifications, requestNotificationPermission]);

  return null;
}
