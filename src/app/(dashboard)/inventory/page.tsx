"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Purchase } from "@/types";
import { InventoryCard } from "@/components/inventory/inventory-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Grid2x2, List, Coins, Package, Filter, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

type SortOption = "newest" | "price-high" | "price-low";
type StatusFilter = "ALL" | "OWNED" | "USED";

export default function InventoryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const supabase = createClient();

  const fetchPurchases = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("Purchase")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      toast.error("인벤토리를 불러오는데 실패했습니다.");
      console.error("Fetch error:", error);
      return;
    }
    console.log("Fetched purchases:", data);
    setPurchases(data || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchPurchases();
      setLoading(false);
    };
    init();
  }, []);

  // Handle use item
  const handleUse = async (purchaseId: string) => {
    const { error, data } = await supabase
      .from("Purchase")
      .update({ used: true })
      .eq("id", purchaseId)
      .select();

    if (error) {
      console.error("Update error:", error);
      toast.error(`사용 처리에 실패했습니다: ${error.message}`);
      return;
    }

    console.log("Update result:", data);

    setPurchases((prev) =>
      prev.map((p) => (p.id === purchaseId ? { ...p, used: true } : p))
    );
    toast.success("아이템을 사용했습니다!");
  };

  // Calculate stats
  const totalItems = purchases.length;
  const ownedItems = purchases.filter((p) => !p.used).length;
  const usedItems = purchases.filter((p) => p.used).length;
  const totalValue = purchases.reduce((sum, p) => sum + p.price, 0);

  // Filter and sort
  const filteredPurchases = purchases
    .filter((p) => {
      const matchesSearch = p.rewardName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "OWNED" && !p.used) ||
        (statusFilter === "USED" && p.used);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Stats */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold">내 인벤토리</h1>
            <Badge variant="secondary" className="text-xs uppercase">
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            구매한 디지털 자산과 보상을 관리하세요.
          </p>
        </div>

        {/* Stats */}
        <Card>
          <CardContent className="flex items-center gap-6 p-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                총 아이템
              </span>
              <span className="text-2xl font-bold">{totalItems}</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                총 가치
              </span>
              <div className="flex items-center gap-1">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {totalValue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Control Bar */}
      <section className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-card p-4 rounded-xl border sticky top-20 z-10">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="아이템 이름으로 검색..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Tabs */}
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            className="hidden sm:block"
          >
            <TabsList>
              <TabsTrigger value="ALL" className="gap-1">
                <Package className="h-4 w-4" />
                전체 ({totalItems})
              </TabsTrigger>
              <TabsTrigger value="OWNED" className="gap-1">
                <Circle className="h-4 w-4" />
                보유중 ({ownedItems})
              </TabsTrigger>
              <TabsTrigger value="USED" className="gap-1">
                <CheckCircle2 className="h-4 w-4" />
                사용완료 ({usedItems})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="price-high">가격 높은순</SelectItem>
              <SelectItem value="price-low">가격 낮은순</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="hidden md:flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Inventory Grid */}
      <section
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            로딩 중...
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "검색 결과가 없습니다."
                : "아직 구매한 아이템이 없습니다."}
            </p>
            {!searchQuery && (
              <Button variant="outline" asChild>
                <a href="/rewards">상점 방문하기</a>
              </Button>
            )}
          </div>
        ) : (
          filteredPurchases.map((purchase) => (
            <InventoryCard
              key={purchase.id}
              purchase={purchase}
              viewMode={viewMode}
              onUse={handleUse}
            />
          ))
        )}
      </section>

      {/* Pagination (simplified) */}
      {filteredPurchases.length > 0 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              &lt;
            </Button>
            <Button size="sm" className="h-10 w-10">
              1
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10">
              2
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10">
              3
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              &gt;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
