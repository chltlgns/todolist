"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserGoal, UserSettings } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Target, Bell, Palette, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Goals state
  const [goals, setGoals] = useState({
    dailyHours: 8,
    weeklyHours: 40,
    monthlyHours: 160,
  });

  // Settings state
  const [settings, setSettings] = useState({
    theme: "system" as "system" | "dark" | "navy",
    notificationsEnabled: true,
    emailReminders: false,
    dailySummary: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      // Fetch goals
      const { data: goalsData } = await supabase
        .from("UserGoal")
        .select("*")
        .eq("userId", user.id)
        .single();

      if (goalsData) {
        setGoals({
          dailyHours: goalsData.dailyHours,
          weeklyHours: goalsData.weeklyHours,
          monthlyHours: goalsData.monthlyHours,
        });
      }

      // Fetch settings
      const { data: settingsData } = await supabase
        .from("UserSettings")
        .select("*")
        .eq("userId", user.id)
        .single();

      if (settingsData) {
        setSettings({
          theme: settingsData.theme,
          notificationsEnabled: settingsData.notificationsEnabled,
          emailReminders: settingsData.emailReminders,
          dailySummary: settingsData.dailySummary,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const saveGoals = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("UserGoal")
        .upsert({
          userId,
          dailyHours: goals.dailyHours,
          weeklyHours: goals.weeklyHours,
          monthlyHours: goals.monthlyHours,
          updatedAt: new Date().toISOString(),
        }, { onConflict: "userId" });

      if (error) throw error;
      toast.success("목표가 저장되었습니다!");
    } catch (error) {
      toast.error("목표 저장에 실패했습니다.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("UserSettings")
        .upsert({
          userId,
          theme: settings.theme,
          notificationsEnabled: settings.notificationsEnabled,
          emailReminders: settings.emailReminders,
          dailySummary: settings.dailySummary,
          updatedAt: new Date().toISOString(),
        }, { onConflict: "userId" });

      if (error) throw error;

      // Apply theme
      applyTheme(settings.theme);

      toast.success("설정이 저장되었습니다!");
    } catch (error) {
      toast.error("설정 저장에 실패했습니다.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (theme: "system" | "dark" | "navy") => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("dark", "navy");

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "navy") {
      root.classList.add("navy");
    }
    // "system" = light theme (no class needed, uses :root)

    localStorage.setItem("theme", theme);
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setSettings({ ...settings, notificationsEnabled: true });
      toast.success("알림이 활성화되었습니다!");
    } else {
      toast.error("알림 권한이 거부되었습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <section className="flex flex-col gap-2 pb-4 border-b">
        <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          설정
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">환경설정</h1>
        <p className="text-muted-foreground text-sm">
          목표와 알림 설정을 관리하세요.
        </p>
      </section>

      {/* Goal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            작업 목표 설정
          </CardTitle>
          <CardDescription>
            일간, 주간, 월간 작업 시간 목표를 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyHours">일간 목표 (시간)</Label>
              <Input
                id="dailyHours"
                type="number"
                min={1}
                max={24}
                step={0.5}
                value={goals.dailyHours}
                onChange={(e) =>
                  setGoals({ ...goals, dailyHours: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weeklyHours">주간 목표 (시간)</Label>
              <Input
                id="weeklyHours"
                type="number"
                min={1}
                max={168}
                step={1}
                value={goals.weeklyHours}
                onChange={(e) =>
                  setGoals({ ...goals, weeklyHours: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyHours">월간 목표 (시간)</Label>
              <Input
                id="monthlyHours"
                type="number"
                min={1}
                max={744}
                step={1}
                value={goals.monthlyHours}
                onChange={(e) =>
                  setGoals({ ...goals, monthlyHours: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
          <Button onClick={saveGoals} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            목표 저장
          </Button>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            테마 설정
          </CardTitle>
          <CardDescription>
            앱의 테마를 선택하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>테마</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: "system" | "dark" | "navy") => {
                setSettings({ ...settings, theme: value });
                applyTheme(value);
              }}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">Clean Minimal (라이트)</SelectItem>
                <SelectItem value="dark">Obsidian Gold (다크)</SelectItem>
                <SelectItem value="navy">Midnight Pro (네이비)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            알림 설정
          </CardTitle>
          <CardDescription>
            알림 및 리마인더 설정을 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>브라우저 알림</Label>
              <p className="text-sm text-muted-foreground">
                할일 시작 전 브라우저 알림을 받습니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!settings.notificationsEnabled && (
                <Button variant="outline" size="sm" onClick={requestNotificationPermission}>
                  권한 요청
                </Button>
              )}
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notificationsEnabled: checked })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>이메일 리마인더</Label>
              <p className="text-sm text-muted-foreground">
                중요한 할일에 대해 이메일 알림을 받습니다.
              </p>
            </div>
            <Switch
              checked={settings.emailReminders}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailReminders: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>일일 요약</Label>
              <p className="text-sm text-muted-foreground">
                매일 아침 오늘의 할일 요약을 받습니다.
              </p>
            </div>
            <Switch
              checked={settings.dailySummary}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, dailySummary: checked })
              }
            />
          </div>

          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            설정 저장
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
