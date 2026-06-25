"use client";
import { useState } from "react";
import { Modal } from "@/components/ui/overlays/Modal";
import { Drawer } from "@/components/ui/overlays/Drawer";
import { Button } from "@/components/ui/primitives/Button";
import { PreviewSection, PreviewBlock } from "../PreviewUtils";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
type DrawerSide = "right" | "left" | "bottom";

export default function ModalSection() {
  const [openModal, setOpenModal] = useState<ModalSize | null>(null);
  const [openDrawer, setOpenDrawer] = useState<DrawerSide | null>(null);

  return (
    <>
      <PreviewSection
        id="modal"
        title="Modal"
        description="Dialog overlay for focused interactions."
      >
        <PreviewBlock
          title="Modal Sizes"
          description="Click to open each size"
        >
          <div className="flex flex-wrap gap-3">
            {(["sm", "md", "lg", "xl", "full"] as ModalSize[]).map((size) => (
              <Button
                key={size}
                variant="secondary"
                onClick={() => setOpenModal(size)}
              >
                Open {size.toUpperCase()}
              </Button>
            ))}
          </div>
        </PreviewBlock>

        {/* Modal instances */}
        <Modal
          isOpen={openModal === "sm"}
          onClose={() => setOpenModal(null)}
          title="Small Modal"
          description="A compact dialog for short messages."
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpenModal(null)}>
                Cancel
              </Button>
              <Button onClick={() => setOpenModal(null)}>Confirm</Button>
            </>
          }
        >
          <p className="text-sm text-muted-foreground">
            This is a small modal with a short confirmation message.
          </p>
        </Modal>

        <Modal
          isOpen={openModal === "md"}
          onClose={() => setOpenModal(null)}
          title="Medium Modal"
          description="Default size for most dialogs."
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpenModal(null)}>
                Cancel
              </Button>
              <Button onClick={() => setOpenModal(null)}>Save Changes</Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-(--color-ink)">
              This is the default modal size. It is suitable for forms, confirmations,
              and detail views that don&apos;t require full-screen space.
            </p>
            <p className="text-sm text-muted-foreground">
              The modal adapts to its content height and is centered on the screen.
            </p>
          </div>
        </Modal>

        <Modal
          isOpen={openModal === "lg"}
          onClose={() => setOpenModal(null)}
          title="Large Modal"
          size="lg"
          footer={
            <Button variant="secondary" onClick={() => setOpenModal(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-(--color-ink)">
              Large modal for content-heavy dialogs. Good for forms with many fields,
              image previews, or rich content.
            </p>
            <div className="bg-(--color-paper) rounded-lg p-4">
              <p className="text-xs text-muted-foreground">
                Inner content area — can hold forms, tables, or any rich content.
              </p>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={openModal === "xl"}
          onClose={() => setOpenModal(null)}
          title="Extra Large Modal"
          size="xl"
          footer={
            <Button variant="secondary" onClick={() => setOpenModal(null)}>
              Close
            </Button>
          }
        >
          <p className="text-sm text-(--color-ink)">
            Extra large modal for complex workflows, dashboards, or detailed record views.
          </p>
        </Modal>

        <Modal
          isOpen={openModal === "full"}
          onClose={() => setOpenModal(null)}
          title="Full Width Modal"
          size="full"
          footer={
            <Button variant="secondary" onClick={() => setOpenModal(null)}>
              Close
            </Button>
          }
        >
          <p className="text-sm text-(--color-ink)">
            Full-width modal that spans nearly the entire viewport. Use for immersive experiences.
          </p>
        </Modal>
      </PreviewSection>

      <PreviewSection
        id="drawer"
        title="Drawer"
        description="Slide-in panel from screen edge."
      >
        <PreviewBlock
          title="Drawer Sides"
          description="Click to open from each side"
        >
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => setOpenDrawer("right")}
            >
              Open Right
            </Button>
            <Button
              variant="secondary"
              onClick={() => setOpenDrawer("left")}
            >
              Open Left
            </Button>
            <Button
              variant="secondary"
              onClick={() => setOpenDrawer("bottom")}
            >
              Open Bottom
            </Button>
          </div>
        </PreviewBlock>

        <Drawer
          isOpen={openDrawer === "right"}
          onClose={() => setOpenDrawer(null)}
          title="Right Drawer"
          description="Slides in from the right edge"
          side="right"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setOpenDrawer(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setOpenDrawer(null)}>
                Save
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-(--color-ink)">
              Right drawer content. Common for detail panels, settings, and filters.
            </p>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border border-(--color-smoke) rounded-lg">
                  <p className="text-sm font-medium text-(--color-ink)">
                    Item {i}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Some detail content here
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Drawer>

        <Drawer
          isOpen={openDrawer === "left"}
          onClose={() => setOpenDrawer(null)}
          title="Left Drawer"
          description="Slides in from the left edge"
          side="left"
        >
          <p className="text-sm text-(--color-ink)">
            Left drawer. Good for navigation menus and sidebars.
          </p>
        </Drawer>

        <Drawer
          isOpen={openDrawer === "bottom"}
          onClose={() => setOpenDrawer(null)}
          title="Bottom Drawer"
          description="Slides up from the bottom"
          side="bottom"
        >
          <p className="text-sm text-(--color-ink)">
            Bottom drawer. Commonly used on mobile for action sheets and filters.
          </p>
        </Drawer>
      </PreviewSection>
    </>
  );
}
