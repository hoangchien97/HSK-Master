"use client";

import { Button } from "@/components/ui";
import { toast } from "react-toastify";
import { useState } from "react";
import type { IClass } from "@/interfaces/portal";
import { CModal } from "@/components/portal/common";
import { AlertTriangle } from "lucide-react";
import { deleteClassAction } from "@/actions/class.actions";

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (classId: string) => void;
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
      const result = await deleteClassAction(classData.id);
      if (!result.success) throw new Error(result.error);
      toast.success("Đã xóa lớp thành công!");
      onClose();
      onSuccess(classData.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa lớp");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Xóa lớp học
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="danger"
            isLoading={isDeleting}
            onClick={handleDelete}
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
      <p className="text-sm text-red-600 mt-2">
        Hành động này không thể hoàn tác.
      </p>
    </CModal>
  );
}
