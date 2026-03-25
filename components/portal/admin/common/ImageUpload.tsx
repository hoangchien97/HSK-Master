"use client";

import { useState, useRef } from "react";
import { Button } from "@heroui/react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "admin",
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ hỗ trợ upload ảnh");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);

      const res = await fetch(`/api/portal/upload/file?folder=${folder}`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload thất bại");
      }

      if (json.files?.length) {
        onChange(json.files[0].url);
        toast.success("Upload ảnh thành công");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block w-full max-w-[200px] h-[200px] border rounded-xl overflow-hidden group border-default-200">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                isIconOnly
                size="sm"
                color="danger"
                variant="flat"
                className="rounded-full"
                onPress={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!disabled && e.dataTransfer.files?.[0]) {
              uploadFile(e.dataTransfer.files[0]);
            }
          }}
          className={`
            border-2 border-dashed rounded-xl p-6 text-center transition-colors h-[200px] flex flex-col items-center justify-center
            ${dragOver ? "border-primary bg-primary-50" : "border-default-300 hover:border-primary"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-default-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Đang tải lên...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-default-500">
              <Upload className="w-8 h-8" />
              <p className="text-sm">
                Kéo thả ảnh hoặc <span className="text-primary font-medium">chọn ảnh</span>
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => {
              if (e.target.files?.[0]) uploadFile(e.target.files[0]);
            }}
          />
        </div>
      )}
    </div>
  );
}
