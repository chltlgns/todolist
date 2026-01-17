"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  FolderOpen,
  Pencil,
  Trash2,
  Loader2,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_COLORS = [
  "#6764f2", // Primary purple
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#64748b", // Slate
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#6764f2" });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("Category")
      .select("*")
      .eq("userId", user.id)
      .order("createdAt", { ascending: false });

    if (error) {
      toast.error("카테고리를 불러오는데 실패했습니다.");
      console.error(error);
      return;
    }
    setCategories(data || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };
    init();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("카테고리 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      const { error } = await supabase.from("Category").insert({
        userId: user.id,
        name: formData.name.trim(),
        color: formData.color,
      });

      if (error) {
        toast.error("카테고리 생성에 실패했습니다.");
        console.error(error);
        return;
      }

      toast.success("카테고리가 생성되었습니다!");
      setFormData({ name: "", color: "#6764f2" });
      setIsCreateOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("오류가 발생했습니다.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!formData.name.trim() || !editingCategory) {
      toast.error("카테고리 이름을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("Category")
        .update({
          name: formData.name.trim(),
          color: formData.color,
        })
        .eq("id", editingCategory.id);

      if (error) {
        toast.error("카테고리 수정에 실패했습니다.");
        console.error(error);
        return;
      }

      toast.success("카테고리가 수정되었습니다!");
      setFormData({ name: "", color: "#6764f2" });
      setIsEditOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error("오류가 발생했습니다.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("정말로 이 카테고리를 삭제하시겠습니까?")) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("Category")
        .delete()
        .eq("id", categoryId);

      if (error) {
        toast.error("카테고리 삭제에 실패했습니다.");
        console.error(error);
        return;
      }

      toast.success("카테고리가 삭제되었습니다.");
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (error) {
      toast.error("오류가 발생했습니다.");
      console.error(error);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
    setIsEditOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            카테고리 관리
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold">카테고리</h1>
            <Button
              size="sm"
              onClick={() => {
                setFormData({ name: "", color: "#6764f2" });
                setIsCreateOpen(true);
              }}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              카테고리 추가
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            할일을 분류할 카테고리를 만들고 관리하세요.
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            로딩 중...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              아직 카테고리가 없습니다.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setFormData({ name: "", color: "#6764f2" });
                setIsCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              카테고리 만들기
            </Button>
          </div>
        ) : (
          categories.map((category) => (
            <Card
              key={category.id}
              className="group relative overflow-hidden border-l-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: category.color }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              새 카테고리
            </DialogTitle>
            <DialogDescription>
              할일을 분류할 새 카테고리를 만드세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">카테고리 이름</Label>
              <Input
                id="name"
                placeholder="예: 업무, 개인, 공부"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Palette className="h-3 w-3" /> 색상
              </Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      formData.color === color
                        ? "border-white ring-2 ring-primary"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              카테고리 수정
            </DialogTitle>
            <DialogDescription>카테고리 정보를 수정하세요.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">카테고리 이름</Label>
              <Input
                id="edit-name"
                placeholder="예: 업무, 개인, 공부"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Palette className="h-3 w-3" /> 색상
              </Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      formData.color === color
                        ? "border-white ring-2 ring-primary"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsEditOpen(false)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Pencil className="h-4 w-4 mr-2" />
              )}
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
