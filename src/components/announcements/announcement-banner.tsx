"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Announcement, AnnouncementType } from "@/types";

const TYPE_CONFIG: Record<AnnouncementType, { icon: React.ElementType; bgColor: string; borderColor: string; textColor: string }> = {
  info: {
    icon: Info,
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/20",
    textColor: "text-yellow-600 dark:text-yellow-400",
  },
  important: {
    icon: AlertCircle,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    textColor: "text-red-600 dark:text-red-400",
  },
};

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const supabase = createClient();

      const now = new Date().toISOString();

      const { data } = await supabase
        .from("Announcement")
        .select("*")
        .eq("isActive", true)
        .or(`startDate.is.null,startDate.lte.${now}`)
        .or(`endDate.is.null,endDate.gte.${now}`)
        .order("priority", { ascending: false })
        .order("createdAt", { ascending: false })
        .limit(3);

      if (data) {
        setAnnouncements(data);
      }
    };

    // Load dismissed IDs from localStorage
    const storedDismissed = localStorage.getItem("dismissedAnnouncements");
    if (storedDismissed) {
      setDismissedIds(new Set(JSON.parse(storedDismissed)));
    }

    fetchAnnouncements();
  }, []);

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds).add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem(
      "dismissedAnnouncements",
      JSON.stringify([...newDismissed])
    );
  };

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedIds.has(a.id)
  );

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {visibleAnnouncements.map((announcement) => {
        const config = TYPE_CONFIG[announcement.type];
        const Icon = config.icon;

        return (
          <div
            key={announcement.id}
            className={cn(
              "relative flex items-start gap-3 p-4 rounded-lg border",
              config.bgColor,
              config.borderColor
            )}
          >
            <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.textColor)} />
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium", config.textColor)}>
                {announcement.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {announcement.content}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="닫기"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
