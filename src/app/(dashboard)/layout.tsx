import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { NavTabs } from "@/components/layout/nav-tabs";
import { NotificationManager } from "@/components/notifications/notification-manager";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // User 레코드 가져오기 또는 생성
  let { data: dbUser } = await supabase
    .from("User")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!dbUser) {
    const { data: newUser } = await supabase
      .from("User")
      .insert({
        id: user.id,
        email: user.email!,
        coins: 100,
      })
      .select()
      .single();
    dbUser = newUser;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={user.email!} coins={dbUser?.coins ?? 0} />
      <NavTabs />
      <main className="flex-1 container px-4 py-6">{children}</main>
      <NotificationManager userId={user.id} />
    </div>
  );
}
