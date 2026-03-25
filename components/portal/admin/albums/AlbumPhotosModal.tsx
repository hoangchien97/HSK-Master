"use client";

import { useState, useEffect } from "react";
import { Button, Input, Textarea, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import type { IAlbum, IAlbumPhoto } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { saveAlbumPhotosAction } from "@/actions/admin.actions";
import ImageUpload from "@/components/portal/admin/common/ImageUpload";
import { Trash2, GripVertical, Plus } from "lucide-react";

interface AlbumPhotosModalProps {
  isOpen: boolean;
  onClose: () => void;
  album: IAlbum;
}

export default function AlbumPhotosModal({
  isOpen,
  onClose,
  album,
}: AlbumPhotosModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<Partial<IAlbumPhoto>[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPhotos([...(album.photos || [])]);
    }
  }, [isOpen, album]);

  const addPhoto = () => {
    setPhotos([
      ...photos,
      {
        url: "",
        title: "",
        description: "",
        order: photos.length + 1,
      },
    ]);
  };

  const updatePhoto = (index: number, field: keyof IAlbumPhoto, value: any) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], [field]: value };
    setPhotos(newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    const validPhotos = photos.filter(p => !!p.url);
    if (photos.length > 0 && validPhotos.length !== photos.length) {
      toast.warning("Có ảnh trống chưa được tải lên");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveAlbumPhotosAction(album.id, validPhotos as any);
      if (!result.success) throw new Error(result.error);
      toast.success("Lưu danh sách ảnh thành công!");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lưu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      title={`Quản lý ảnh: ${album.title}`}
      footer={
        <>
          <Button variant="flat" onPress={onClose}>Hủy</Button>
          <Button color="primary" isLoading={isSubmitting} onPress={handleSubmit}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="flex justify-between items-center bg-default-100 p-4 rounded-xl">
          <div>
            <h3 className="text-sm font-semibold">Danh sách ảnh ({photos.length})</h3>
            <p className="text-xs text-default-500">Tải lên file ảnh và điều chỉnh thứ tự hiển thị.</p>
          </div>
          <Button color="primary" variant="flat" size="sm" startContent={<Plus className="w-4 h-4" />} onPress={addPhoto}>
            Thêm ảnh mới
          </Button>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-10 text-default-400 text-sm">
            Tạm chưa có ảnh nào
          </div>
        ) : (
          <div className="space-y-4">
            {photos.map((photo, i) => (
              <div key={photo.id || `new-${i}`} className="flex flex-col md:flex-row gap-4 p-4 border border-default-200 rounded-xl relative group bg-white">
                <div className="shrink-0 pt-1 hidden md:block text-default-300">
                  <GripVertical className="w-5 h-5 cursor-move" />
                </div>

                <div className="shrink-0">
                  <ImageUpload
                    value={photo.url || ""}
                    onChange={(url) => updatePhoto(i, "url", url)}
                    folder="albums"
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-3">
                      <Input
                        label="Tiêu đề"
                        size="sm"
                        placeholder="Tiêu đề ảnh (không rỗng nếu có mô tả)"
                        value={photo.title || ""}
                        onValueChange={(v) => updatePhoto(i, "title", v)}
                      />
                    </div>
                    <Input
                      label="Thứ tự"
                      type="number"
                      size="sm"
                      value={String(photo.order)}
                      onValueChange={(v) => updatePhoto(i, "order", Number(v) || 0)}
                    />
                  </div>
                  <Textarea
                    label="Mô tả"
                    size="sm"
                    minRows={2}
                    placeholder="Mô tả ảnh..."
                    value={photo.description || ""}
                    onValueChange={(v) => updatePhoto(i, "description", v)}
                  />
                </div>

                <button
                  className="absolute top-2 right-2 p-2 rounded-full hover:bg-danger-50 text-default-400 hover:text-danger bg-white"
                  onClick={() => removePhoto(i)}
                  title="Xóa ảnh"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </CModal>
  );
}
