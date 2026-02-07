"use client";

import {
  Button,
} from "@heroui/react";
import { toast } from "react-toastify";
import { useState } from "react";
import type { IClass } from "@/app/interfaces/portal";
import { CModal } from "@/app/components/portal/common";
import { AlertTriangle } from "lucide-react";

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classData: IClass;
}

export default function DeleteClassModal({
  isOpen,
  onClose,
  onSuccess,
  classData,
}: DeleteClassModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/portal/classes/${classData.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa lớp thất bại");
      toast.success("Đã xóa lớp thành công!");
      onClose();
      onSuccess();
    } catch {
      toast.error("Không thể xóa lớp");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeIcon={AlertTriangle}
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-danger" />
          Xóa lớp học
        </div>
      }
      footer={
        <>
          <Button variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button
            color="danger"
            isLoading={isDeleting}
            onPress={handleDelete}
          >
            Xóa
          </Button>
        </>
      }
    >
      <p>
        Bạn có chắc chắn muốn xóa lớp{" "}
        <strong>{classData.className}</strong> ({classData.classCode})?
      </p>
      <p className="text-sm text-danger mt-2">
        Hành động này không thể hoàn tác.
      </p>
    </CModal>
  );
}
