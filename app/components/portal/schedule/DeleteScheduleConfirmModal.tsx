"use client";

import { Button } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { CModal } from "../common";
import { toast } from "react-toastify";
import { useState } from "react";
import type { ISchedule } from "@/app/interfaces/portal";

interface DeleteScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule: ISchedule;
}

export default function DeleteScheduleConfirmModal({
  isOpen,
  onClose,
  onSuccess,
  schedule,
}: DeleteScheduleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/portal/schedules/${schedule.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa lịch thất bại");
      toast.success("Đã xóa buổi học!");
      onClose();
      onSuccess();
    } catch {
      toast.error("Không thể xóa buổi học");
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
      title="Xóa buổi học"
      footer={
        <>
          <Button variant="flat" onPress={onClose}>
            Hủy
          </Button>
          <Button color="danger" isLoading={isDeleting} onPress={handleDelete}>
            Xóa
          </Button>
        </>
      }
    >
      <p>
        Bạn có chắc chắn muốn xóa buổi học{" "}
        <strong>{schedule.title}</strong>?
      </p>
      <p className="text-sm text-danger mt-2">
        Hành động này không thể hoàn tác.
      </p>
    </CModal>
  );
}
