"use client";
import { Badge } from "@/components/ui/primitives/Badge";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function BadgeSection() {
  return (
    <PreviewSection
      id="badge"
      title="Badge"
      description="Small status indicators and labels."
    >
      <PreviewBlock title="Variants" description="All semantic color variants">
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Sizes">
        <div className="flex flex-wrap items-center gap-3">
          <Badge size="sm" variant="primary">
            Small
          </Badge>
          <Badge size="md" variant="primary">
            Medium
          </Badge>
          <Badge size="sm" variant="success">
            Small Success
          </Badge>
          <Badge size="md" variant="success">
            Medium Success
          </Badge>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Usage Examples" description="Common badge patterns">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-(--color-ink)">Nguyễn Văn A</span>
            <Badge variant="info" size="sm">
              STUDENT
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-(--color-ink)">HSK Level 3</span>
            <Badge variant="primary" size="sm">
              In Progress
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-(--color-ink)">Account</span>
            <Badge variant="success" size="sm">
              Active
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-(--color-ink)">Payment</span>
            <Badge variant="warning" size="sm">
              Pending
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-(--color-ink)">Access</span>
            <Badge variant="danger" size="sm">
              Blocked
            </Badge>
          </div>
        </div>
      </PreviewBlock>

      <PropsTable
        props={[
          {
            name: "variant",
            type: '"default" | "primary" | "success" | "warning" | "danger" | "info"',
            default: '"default"',
            description: "Color style of the badge",
          },
          {
            name: "size",
            type: '"sm" | "md"',
            default: '"md"',
            description: "Size of the badge",
          },
        ]}
      />
    </PreviewSection>
  );
}
