"use client";
import { Avatar } from "@/components/ui/primitives/Avatar";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function AvatarSection() {
  return (
    <PreviewSection
      id="avatar"
      title="Avatar"
      description="User profile images with fallback initials."
    >
      <PreviewBlock
        title="Sizes"
        description="Four size options with image src"
      >
        <div className="flex items-end gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src="https://i.pravatar.cc/64?img=1"
              alt="User"
              name="Nguyễn Văn A"
              size="sm"
            />
            <span className="text-xs text-muted-foreground">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src="https://i.pravatar.cc/64?img=2"
              alt="User"
              name="Lê Hương"
              size="md"
            />
            <span className="text-xs text-muted-foreground">md</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src="https://i.pravatar.cc/64?img=3"
              alt="User"
              name="Trần Minh"
              size="lg"
            />
            <span className="text-xs text-muted-foreground">lg</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar
              src="https://i.pravatar.cc/64?img=4"
              alt="User"
              name="Phạm Lan"
              size="xl"
            />
            <span className="text-xs text-muted-foreground">xl</span>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock
        title="Fallback Initials"
        description="Avatar with no src — falls back to name initials"
      >
        <div className="flex items-end gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar name="Nguyễn Văn A" size="sm" />
            <span className="text-xs text-muted-foreground">sm</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar name="Lê Hương" size="md" />
            <span className="text-xs text-muted-foreground">md</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar name="Trần Minh Tuấn" size="lg" />
            <span className="text-xs text-muted-foreground">lg</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar name="Phạm Thị Lan" size="xl" />
            <span className="text-xs text-muted-foreground">xl</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Avatar size="md" />
            <span className="text-xs text-muted-foreground">no name</span>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock
        title="Avatar Group"
        description="Stacked avatars in a group"
      >
        <div className="flex -space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Avatar
              key={i}
              src={`https://i.pravatar.cc/64?img=${i}`}
              size="md"
              className="ring-2 ring-white"
            />
          ))}
          <div className="w-8 h-8 rounded-full bg-(--color-smoke) flex items-center justify-center text-xs font-medium text-(--color-ink) ring-2 ring-white">
            +3
          </div>
        </div>
      </PreviewBlock>

      <PropsTable
        props={[
          {
            name: "src",
            type: "string | null",
            default: "—",
            description: "Image URL to display",
          },
          {
            name: "alt",
            type: "string",
            default: "—",
            description: "Alt text for the image",
          },
          {
            name: "name",
            type: "string",
            default: "—",
            description: "Name used to generate fallback initials",
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg" | "xl"',
            default: '"md"',
            description: "Size of the avatar",
          },
        ]}
      />
    </PreviewSection>
  );
}
