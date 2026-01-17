import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const now = new Date();

    // Get todos that need notification (uncompleted todos with start time and notify setting)
    const { data: todos, error } = await supabase
      .from("Todo")
      .select("*")
      .eq("userId", userId)
      .eq("completed", false)
      .not("notifyBefore", "is", null)
      .not("startTime", "is", null);

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json({ notifications: [] });
    }

    // Filter todos that should be notified
    const notifications = (todos || []).filter((todo) => {
      if (!todo.startTime || !todo.notifyBefore) return false;

      const startTime = new Date(todo.startTime);
      const notifyTime = new Date(startTime.getTime() - todo.notifyBefore * 60 * 1000);

      return now >= notifyTime && now < startTime;
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notification API error:", error);
    return NextResponse.json({ notifications: [] });
  }
}
