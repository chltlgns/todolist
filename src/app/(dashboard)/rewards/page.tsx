"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Reward } from "@/types";
import { RewardCard } from "@/components/rewards/reward-card";
import { CreateRewardDialog } from "@/components/rewards/create-reward-dialog";
import { EditRewardDialog } from "@/components/rewards/edit-reward-dialog";
import { DeleteRewardDialog } from "@/components/rewards/delete-reward-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Grid2x2, Sparkles, Zap, Palette, Gift, Plus } from "lucide-react";
import { toast } from "sonner";

type Category = "ALL" | "AVATAR" | "THEME" | "BOOSTER";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoins, setUserCoins] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from("Reward")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      toast.error("보상 목록을 불러오는데 실패했습니다.");
      return;
    }
    setRewards(data || []);
  };

  const fetchUserCoins = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data } = await supabase
      .from("User")
      .select("coins")
      .eq("id", user.id)
      .single();

    if (data) {
      setUserCoins(data.coins);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchRewards(), fetchUserCoins()]);
      setLoading(false);
    };
    init();
  }, []);

  const handlePurchase = async (reward: Reward) => {
    if (!userId) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    if (userCoins < reward.price) {
      toast.error("코인이 부족합니다.");
      return;
    }

    // 중복 클릭 방지
    if (purchasingId) {
      return;
    }

    setPurchasingId(reward.id);

    try {
      // 최신 코인 잔액 확인 (동시성 문제 방지)
      const { data: currentUser } = await supabase
        .from("User")
        .select("coins")
        .eq("id", userId)
        .single();

      if (!currentUser || currentUser.coins < reward.price) {
        toast.error("코인이 부족합니다.");
        return;
      }

      // 코인 차감
      const { error: updateError } = await supabase
        .from("User")
        .update({ coins: currentUser.coins - reward.price })
        .eq("id", userId);

      if (updateError) {
        toast.error("구매에 실패했습니다.");
        return;
      }

      // 구매 기록 추가
      const { error: purchaseError } = await supabase.from("Purchase").insert({
        userId,
        rewardId: reward.id,
        rewardName: reward.name,
        price: reward.price,
        used: false,
      });

      if (purchaseError) {
        toast.error("구매 기록 저장에 실패했습니다.");
        // 코인 롤백
        await supabase
          .from("User")
          .update({ coins: currentUser.coins })
          .eq("id", userId);
        return;
      }

      setUserCoins(currentUser.coins - reward.price);
      toast.success(`${reward.name} 구매 완료! -${reward.price} 코인`);
    } finally {
      setPurchasingId(null);
    }
  };

  const handleEdit = (reward: Reward) => {
    setSelectedReward(reward);
    setEditDialogOpen(true);
  };

  const handleDelete = (reward: Reward) => {
    setSelectedReward(reward);
    setDeleteDialogOpen(true);
  };

  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch = reward.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // For now, show all rewards since we don't have category field
    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            마켓플레이스
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">보상 상점</h1>
            <Button
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              보상 등록
            </Button>
          </div>
          <p className="text-muted-foreground max-w-lg text-sm">
            열심히 얻은 TaskCoin으로 디지털 자산, 부스터, 프리미엄 테마를
            구매하세요.
          </p>
        </div>
        <Tabs
          value={activeCategory}
          onValueChange={(value) => setActiveCategory(value as Category)}
        >
          <TabsList>
            <TabsTrigger value="ALL">Featured</TabsTrigger>
            <TabsTrigger value="NEW">신규</TabsTrigger>
            <TabsTrigger value="LIMITED">한정</TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Filter Toolbar */}
      <section className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card p-4 rounded-xl border">
        {/* Category Chips */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === "ALL" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveCategory("ALL")}
          >
            <Grid2x2 className="h-4 w-4 mr-2" />
            전체
          </Button>
          <Button
            variant={activeCategory === "AVATAR" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveCategory("AVATAR")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            아바타
          </Button>
          <Button
            variant={activeCategory === "THEME" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveCategory("THEME")}
          >
            <Palette className="h-4 w-4 mr-2" />
            테마
          </Button>
          <Button
            variant={activeCategory === "BOOSTER" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveCategory("BOOSTER")}
          >
            <Zap className="h-4 w-4 mr-2" />
            부스터
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="보상 검색..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Rewards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            로딩 중...
          </div>
        ) : filteredRewards.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "검색 결과가 없습니다."
                : "아직 보상이 등록되지 않았습니다."}
            </p>
          </div>
        ) : (
          filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userCoins={userCoins}
              onPurchase={handlePurchase}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isPurchasing={purchasingId === reward.id}
            />
          ))
        )}
      </section>

      {/* Create Reward Dialog */}
      <CreateRewardDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onRewardCreated={fetchRewards}
      />

      {/* Edit Reward Dialog */}
      <EditRewardDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        reward={selectedReward}
        onRewardUpdated={fetchRewards}
      />

      {/* Delete Reward Dialog */}
      <DeleteRewardDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        reward={selectedReward}
        onRewardDeleted={fetchRewards}
      />
    </div>
  );
}
