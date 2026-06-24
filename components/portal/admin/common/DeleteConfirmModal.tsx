"use client";

/**
 * Generic Delete Confirmation Modal for admin CRUD pages
 */

import { Button } from "@/components/ui";
import { toast } from "react-toastify";
import { useState } from "react";
import { CModal } from "@/components/portal/common";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
  itemId: string;
  itemName: string;
  entityLabel: string;
  deleteAction: (id: string) => Promise<{ success: boolean; error?: string }>;
  warningMessage?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onSuccess,
  itemId,
  itemName,
  entityLabel,
  deleteAction,
  warningMessage,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAction(itemId);
      if (!result.success) throw new Error(result.error);
      toast.success(`Đã xóa ${entityLabel} thành công!`);
      onClose();
      onSuccess(itemId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Không thể xóa ${entityLabel}`);
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
          Xóa {entityLabel}
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
        Bạn có chắc chắn muốn xóa{" "}
        <strong>{itemName}</strong>?
      </p>
      {warningMessage ? (
        <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded-md border border-amber-200">
          {warningMessage}
        </p>
      ) : (
        <p className="text-sm text-red-600 mt-2">
          Hành động này không thể hoàn tác.
        </p>
      )}
    </CModal>
  );
}
