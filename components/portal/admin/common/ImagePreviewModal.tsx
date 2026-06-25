"use client";

import { Dialog, DialogContent } from "@/components/ui/overlays/Modal";

interface ImagePreviewModalProps {
  url: string;
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function ImagePreviewModal({ url, isOpen, onOpenChange }: ImagePreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-transparent shadow-none border-none max-w-5xl flex items-center justify-center p-0 [&>button]:hidden"
        onClick={onOpenChange}
      >
        <img src={url} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
      </DialogContent>
    </Dialog>
  );
}
