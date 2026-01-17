"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Reward } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  onRewardDeleted: () => void;
}

export function DeleteRewardDialog({
  open,
  onOpenChange,
  reward,
  onRewardDeleted,
}: DeleteRewardDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!reward) return;

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("Reward")
        .delete()
        .eq("id", reward.id);

      if (error) {
        const errorMsg = error.message || error.code || JSON.stringify(error);
        toast.error(`보상 삭제 실패: ${errorMsg}`);
        console.error("Supabase error:", error);
        return;
      }

      toast.success(`"${reward.name}" 보상이 삭제되었습니다.`);
      onOpenChange(false);
      onRewardDeleted();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("오류가 발생했습니다.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            보상 삭제
          </AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold text-foreground">{reward?.name}</span>
            {" "}보상을 정말 삭제하시겠습니까?
            <br />
            <span className="text-destructive">이 작업은 되돌릴 수 없습니다.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
