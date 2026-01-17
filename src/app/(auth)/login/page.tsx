"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, Coins } from "lucide-react";

// 인앱 브라우저 감지 및 외부 브라우저로 이동
function getInAppBrowserType(): string | null {
  if (typeof window === "undefined") return null;
  const ua = navigator.userAgent || navigator.vendor;

  if (/KAKAOTALK/i.test(ua)) return "kakaotalk";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV/i.test(ua)) return "facebook";
  if (/NAVER/i.test(ua)) return "naver";
  if (/Line/i.test(ua)) return "line";
  return null;
}

function openInExternalBrowser(url: string) {
  const browserType = getInAppBrowserType();
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (browserType === "kakaotalk") {
    // 카카오톡: 외부 브라우저로 열기
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    return true;
  }

  if (browserType === "instagram" || browserType === "facebook") {
    // 인스타그램/페이스북: Safari나 Chrome으로 열기 시도
    if (isIOS) {
      window.location.href = `googlechrome://${url.replace(/https?:\/\//, '')}`;
      setTimeout(() => {
        window.location.href = url; // Chrome이 없으면 Safari로 폴백
      }, 500);
      return true;
    }
  }

  if (isAndroid) {
    // 안드로이드: Intent로 Chrome 열기
    window.location.href = `intent://${url.replace(/https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    return true;
  }

  return false;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("로그인 성공!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const inAppBrowser = getInAppBrowserType();

    // 인앱 브라우저에서는 외부 브라우저로 이동
    if (inAppBrowser) {
      const currentUrl = window.location.href;
      const opened = openInExternalBrowser(currentUrl);

      if (!opened) {
        // 외부 브라우저로 열기 실패 시 안내
        toast.error("인앱 브라우저에서는 Google 로그인이 지원되지 않습니다.", {
          duration: 5000,
        });
        try {
          await navigator.clipboard.writeText(currentUrl);
          toast.info("URL이 복사되었습니다. 브라우저에 붙여넣기 해주세요.", {
            duration: 3000,
          });
        } catch {
          // ignore
        }
      }
      return;
    }

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("Google OAuth error:", error);
        toast.error(error.message);
      }
    } catch (err) {
      console.error("Google login exception:", err);
      toast.error("Google 로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full bg-primary/20 blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full bg-yellow-500/10 blur-[80px] opacity-40" />
      </div>

      <div className="w-full max-w-[420px] flex flex-col gap-6 relative z-10">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6">
            {/* Brand Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative group cursor-default">
                {/* Icon Container */}
                <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-lg rotate-3 transition-transform duration-300 group-hover:rotate-0">
                  <Coins className="h-8 w-8 text-white drop-shadow-md" />
                </div>
                {/* Floating Coin Particle */}
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-300/80 blur-[1px] animate-bounce" />
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <h1 className="text-2xl font-bold">TaskCoin</h1>
                <p className="text-muted-foreground text-sm">
                  생산성을 게임화하세요. 일하면서 보상을 받으세요.
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  이메일 주소
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    비밀번호
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    비밀번호 찾기
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 mt-2 group"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    로그인
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">또는</span>
              <Separator className="flex-1" />
            </div>

            {/* Social Login */}
            <div className="flex flex-col gap-3">
              <Button variant="outline" type="button" className="h-10 w-full" onClick={handleGoogleLogin}>
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 계속하기
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                계정이 없으신가요?{" "}
                <Link
                  href="/signup"
                  className="text-foreground font-semibold hover:text-primary transition-colors"
                >
                  회원가입
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Links */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <Link href="#" className="hover:text-foreground transition-colors">
            개인정보처리방침
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            이용약관
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            도움말
          </Link>
        </div>
      </div>
    </div>
  );
}
