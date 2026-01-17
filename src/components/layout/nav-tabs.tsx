"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ListTodo, Gift, Package, FolderOpen, CalendarDays, Kanban, Timer, Settings, Repeat } from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "대시보드",
    icon: LayoutDashboard,
  },
  {
    href: "/todos",
    label: "할일",
    icon: ListTodo,
  },
  {
    href: "/kanban",
    label: "칸반",
    icon: Kanban,
  },
  {
    href: "/calendar",
    label: "캘린더",
    icon: CalendarDays,
  },
  {
    href: "/recurring",
    label: "반복",
    icon: Repeat,
  },
  {
    href: "/pomodoro",
    label: "포모도로",
    icon: Timer,
  },
  {
    href: "/categories",
    label: "카테고리",
    icon: FolderOpen,
  },
  {
    href: "/rewards",
    label: "상점",
    icon: Gift,
  },
  {
    href: "/inventory",
    label: "인벤토리",
    icon: Package,
  },
  {
    href: "/settings",
    label: "설정",
    icon: Settings,
  },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
