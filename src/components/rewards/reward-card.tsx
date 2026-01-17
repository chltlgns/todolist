"use client";

import { Reward } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Lock, ShoppingCart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardCardProps {
  reward: Reward;
  userCoins: number;
  onPurchase: (reward: Reward) => void;
  isPurchasing?: boolean;
}

export function RewardCard({ reward, userCoins, onPurchase, isPurchasing = false }: RewardCardProps) {
  const canAfford = userCoins >= reward.price;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1",
        !canAfford && "opacity-70 grayscale hover:opacity-100 hover:grayscale-0"
      )}
    >
      <CardContent className="p-4 flex flex-col gap-4">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
          {reward.imageUrl ? (
            <img
              src={reward.imageUrl}
              alt={reward.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <ShoppingCart className="h-12 w-12 text-primary/50" />
            </div>
          )}

          {/* Hover Actions Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            {canAfford ? (
              <Button
                size="sm"
                onClick={() => onPurchase(reward)}
                disabled={isPurchasing}
                className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    구매 중...
                  </>
                ) : (
                  "구매하기"
                )}
              </Button>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                코인 부족
              </Badge>
            )}
          </div>

          {/* Premium Badge */}
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 text-[10px] bg-black/50 text-white border-0"
          >
            PREMIUM
          </Badge>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <h3
            className={cn(
              "text-lg font-semibold leading-tight transition-colors",
              canAfford && "group-hover:text-primary"
            )}
          >
            {reward.name}
          </h3>
          {reward.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {reward.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t">
          <div className="flex items-center gap-1.5">
            <Coins
              className={cn(
                "h-4 w-4",
                canAfford ? "text-yellow-500" : "text-red-500"
              )}
            />
            <span
              className={cn(
                "font-bold text-lg",
                canAfford ? "text-yellow-500" : "text-red-500"
              )}
            >
              {reward.price.toLocaleString()}
            </span>
          </div>
          <Button
            size="sm"
            disabled={!canAfford || isPurchasing}
            onClick={() => onPurchase(reward)}
            className={cn(!canAfford && "cursor-not-allowed")}
          >
            {isPurchasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : canAfford ? (
              "구매"
            ) : (
              "부족"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
