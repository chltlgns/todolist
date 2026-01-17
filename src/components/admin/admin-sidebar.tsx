"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Gift,
  Megaphone,
  BarChart3,
  Settings,
  ChevronLeft,
  Home,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navItems = [
  {
    title: "대시보드",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "사용자 관리",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "보상 관리",
    href: "/admin/rewards",
    icon: Gift,
  },
  {
    title: "공지사항",
    href: "/admin/announcements",
    icon: Megaphone,
  },
  {
    title: "리포트",
    href: "/admin/reports",
    icon: BarChart3,
  },
];

export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-card border-r transition-all duration-300",
          open ? "w-64" : "w-20",
          "transform lg:translate-x-0",
          !open && "max-lg:-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-bold text-lg">Admin</span>
                <span className="text-xs text-muted-foreground">관리자 패널</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => onOpenChange(!open)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", !open && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {open && <span className="font-medium">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
              "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {open && <span className="font-medium">메인으로 돌아가기</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
