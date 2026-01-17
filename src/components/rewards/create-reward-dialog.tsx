"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Gift, Coins, Upload, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRewardCreated: () => void;
}

export function CreateRewardDialog({
  open,
  onOpenChange,
  onRewardCreated,
}: CreateRewardDialogProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 100,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const supabase = createClient();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `rewards/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("이미지 업로드에 실패했습니다.");
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("보상 이름을 입력해주세요.");
      return;
    }

    if (formData.price < 1) {
      toast.error("가격은 1 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Upload image if exists
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase.from("Reward").insert({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.price,
        imageUrl,
      });

      if (error) {
        const errorMsg = error.message || error.code || JSON.stringify(error);
        toast.error(`보상 생성 실패: ${errorMsg}`);
        console.error("Supabase error:", error);
        return;
      }

      toast.success("새 보상이 등록되었습니다!");
      setFormData({
        name: "",
        description: "",
        price: 100,
      });
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
      onRewardCreated();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            새 보상 등록
          </DialogTitle>
          <DialogDescription>
            상점에 판매할 새로운 보상을 등록하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">보상 이름</Label>
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="예: 프리미엄 테마"
                className="pl-10"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="보상에 대한 설명을 입력하세요..."
              className="min-h-[80px] resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>이미지 (선택)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    변경
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full h-40 border-2 border-dashed rounded-lg",
                  "flex flex-col items-center justify-center gap-2 cursor-pointer",
                  "hover:border-primary hover:bg-primary/5 transition-colors",
                  "text-muted-foreground"
                )}
              >
                <Upload className="h-8 w-8" />
                <span className="text-sm">클릭하여 이미지 업로드</span>
                <span className="text-xs">PNG, JPG, GIF (최대 5MB)</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label className="text-yellow-500 flex items-center gap-1">
              <Coins className="h-3 w-3" /> 가격
            </Label>
            <div className="relative max-w-[200px]">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
              <Input
                type="number"
                min={1}
                max={10000}
                className="pl-10 border-yellow-500/30 focus:border-yellow-500/50"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseInt(e.target.value) || 0,
                  })
                }
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-yellow-600 font-medium">
                코인
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Gift className="h-4 w-4 mr-2" />
              )}
              보상 등록
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
