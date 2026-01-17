"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Loader2 } from "lucide-react";
import type { User } from "@/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const supabase = createClient();

        // Get authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/login");
          return;
        }

        // Get user data with role
        const { data: userData, error } = await supabase
          .from("User")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (error || !userData) {
          router.push("/login");
          return;
        }

        // Check if user is admin by email
        const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim()) || [];
        const userEmail = userData.email?.trim() || "";
        const isAdminByEmail = adminEmails.includes(userEmail);
        const isAdminByRole = userData.role === "admin";

        console.log("Admin check:", { userEmail, adminEmails, isAdminByEmail, isAdminByRole });

        if (!isAdminByEmail && !isAdminByRole) {
          router.push("/");
          return;
        }

        setUser(userData);
      } catch (error) {
        console.error("Admin access check failed:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <AdminHeader
          user={user}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
