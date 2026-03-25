"use client";

import { Modal, ModalContent, ModalBody, useDisclosure } from "@heroui/react";

interface ImagePreviewModalProps {
  url: string;
  isOpen: boolean;
  onOpenChange: () => void;
}

export default function ImagePreviewModal({ url, isOpen, onOpenChange }: ImagePreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl" backdrop="blur" classNames={{ base: "bg-transparent shadow-none" }}>
      <ModalContent>
        {() => (
          <ModalBody className="p-0 flex items-center justify-center">
            <img src={url} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl" />
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
}
