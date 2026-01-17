"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckSquare, Coins, LogOut, User, Shield } from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  userEmail: string;
  coins: number;
}

export function Header({ userEmail, coins: initialCoins }: HeaderProps) {
  const [coins, setCoins] = useState(initialCoins);
  const router = useRouter();
  const supabase = createClient();

  // Check if user is admin based on email
  const isAdmin = useMemo(() => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
    return adminEmails.includes(userEmail?.trim() || "");
  }, [userEmail]);

  useEffect(() => {
    setCoins(initialCoins);
  }, [initialCoins]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("로그아웃 중 오류가 발생했습니다.");
      return;
    }
    toast.success("로그아웃되었습니다.");
    router.push("/login");
    router.refresh();
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Office Todo</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-yellow-500">{coins.toLocaleString()}</span>
          </div>

          {/* Admin Panel Link */}
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20"
                title="관리자 패널"
              >
                <Shield className="h-5 w-5 text-primary" />
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(userEmail)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center gap-2 p-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">{userEmail}</span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
