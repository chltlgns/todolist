"use client";

import { Purchase } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Info, Check, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  purchase: Purchase;
  viewMode: "grid" | "list";
  onUse: (purchaseId: string) => void;
}

export function InventoryCard({ purchase, viewMode, onUse }: InventoryCardProps) {
  const formattedDate = format(new Date(purchase.createdAt), "yyyy.MM.dd", {
    locale: ko,
  });
  const isUsed = purchase.used;

  if (viewMode === "list") {
    return (
      <Card className={cn("group hover:-translate-y-0.5 transition-all", isUsed && "opacity-60")}>
        <CardContent className="flex items-center gap-4 p-4">
          {/* Icon */}
          <div className={cn(
            "w-16 h-16 rounded-lg flex items-center justify-center shrink-0",
            isUsed ? "bg-muted" : "bg-gradient-to-br from-primary/20 to-primary/5"
          )}>
            {isUsed ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <Gift className="h-8 w-8 text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold truncate transition-colors",
              isUsed ? "line-through text-muted-foreground" : "group-hover:text-primary"
            )}>
              {purchase.rewardName}
            </h3>
            <p className="text-sm text-muted-foreground">
              획득일: {formattedDate}
            </p>
          </div>

          {/* Status Badge */}
          <Badge variant={isUsed ? "secondary" : "default"}>
            {isUsed ? "사용완료" : "보유중"}
          </Badge>

          {/* Price */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold">{purchase.price.toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!isUsed && (
              <Button size="sm" onClick={() => onUse(purchase.id)}>
                <Check className="h-4 w-4 mr-2" />
                사용
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "group relative overflow-hidden hover:-translate-y-1 transition-all",
      isUsed && "opacity-60"
    )}>
      {/* Rarity Stripe */}
      <div className={cn(
        "absolute top-0 inset-x-4 h-0.5 bg-gradient-to-r from-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity",
        isUsed ? "via-green-500" : "via-primary"
      )} />

      <CardContent className="p-4 flex flex-col gap-4">
        {/* Image/Icon */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            isUsed ? "bg-muted" : "bg-gradient-to-br from-primary/20 to-primary/5"
          )}>
            {isUsed ? (
              <CheckCircle2 className="h-16 w-16 text-green-500/70" />
            ) : (
              <Gift className="h-16 w-16 text-primary/50 group-hover:text-primary/70 transition-colors group-hover:scale-110 duration-300" />
            )}
          </div>

          {/* Hover Actions - only show for non-used items */}
          {!isUsed && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
              <Button
                size="sm"
                onClick={() => onUse(purchase.id)}
                className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              >
                사용하기
              </Button>
            </div>
          )}

          {/* Badge */}
          <Badge
            variant={isUsed ? "secondary" : "default"}
            className={cn(
              "absolute top-2 left-2 text-[10px] border-0",
              isUsed ? "bg-green-500/80 text-white" : "bg-black/50 text-white"
            )}
          >
            {isUsed ? "사용완료" : "보유중"}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1">
          <h3 className={cn(
            "font-semibold leading-tight transition-colors",
            isUsed ? "line-through text-muted-foreground" : "group-hover:text-primary"
          )}>
            {purchase.rewardName}
          </h3>
          <p className="text-sm text-muted-foreground">
            획득일: {formattedDate}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            구매가
          </span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold">
              {purchase.price.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
