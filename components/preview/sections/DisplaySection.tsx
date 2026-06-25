"use client";
import { Divider } from "@/components/ui/primitives/Divider";
import { Progress } from "@/components/ui/primitives/Progress";
import { Skeleton, SkeletonText } from "@/components/ui/primitives/Skeleton";
import { Spinner } from "@/components/ui/primitives/Spinner";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function DisplaySection() {
  return (
    <>
      <PreviewSection
        id="display"
        title="Divider"
        description="Visual separator for content sections."
      >
        <PreviewBlock title="Horizontal Divider" description="Default orientation">
          <div className="space-y-4">
            <p className="text-sm text-(--color-ink)">Content above the divider</p>
            <Divider />
            <p className="text-sm text-(--color-ink)">Content below the divider</p>
          </div>
        </PreviewBlock>

        <PreviewBlock title="Vertical Divider" description="orientation=&quot;vertical&quot;">
          <div className="flex items-center h-10 gap-4">
            <span className="text-sm text-(--color-ink)">Left</span>
            <Divider orientation="vertical" />
            <span className="text-sm text-(--color-ink)">Right</span>
            <Divider orientation="vertical" />
            <span className="text-sm text-(--color-ink)">End</span>
          </div>
        </PreviewBlock>
      </PreviewSection>

      <PreviewSection
        id="progress"
        title="Progress"
        description="Visual indicator for task completion."
      >
        <PreviewBlock title="Variants">
          <div className="space-y-4 max-w-md">
            <Progress value={65} variant="default" label="Default" showValue />
            <Progress value={80} variant="success" label="Success" showValue />
            <Progress value={45} variant="warning" label="Warning" showValue />
            <Progress value={30} variant="danger" label="Danger" showValue />
          </div>
        </PreviewBlock>

        <PreviewBlock title="Sizes">
          <div className="space-y-4 max-w-md">
            <div>
              <p className="text-xs text-muted-foreground mb-1">sm</p>
              <Progress value={60} size="sm" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">md</p>
              <Progress value={60} size="md" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">lg</p>
              <Progress value={60} size="lg" />
            </div>
          </div>
        </PreviewBlock>

        <PreviewBlock title="With Label and Value">
          <div className="space-y-4 max-w-md">
            <Progress value={72} label="HSK Level 3 Progress" showValue />
            <Progress value={100} variant="success" label="Completed" showValue />
            <Progress value={0} label="Not Started" showValue />
          </div>
        </PreviewBlock>

        <PropsTable
          props={[
            {
              name: "value",
              type: "number",
              description: "Current progress value",
            },
            {
              name: "max",
              type: "number",
              default: "100",
              description: "Maximum value",
            },
            {
              name: "variant",
              type: '"default" | "success" | "warning" | "danger"',
              default: '"default"',
              description: "Color variant",
            },
            {
              name: "size",
              type: '"sm" | "md" | "lg"',
              default: '"md"',
              description: "Height of the progress bar",
            },
            {
              name: "label",
              type: "string",
              description: "Label shown above the bar",
            },
            {
              name: "showValue",
              type: "boolean",
              default: "false",
              description: "Shows percentage value above the bar",
            },
          ]}
        />
      </PreviewSection>

      <PreviewSection
        id="skeleton"
        title="Skeleton"
        description="Loading placeholder animations."
      >
        <PreviewBlock title="Variants">
          <div className="space-y-4 max-w-sm">
            <div>
              <p className="text-xs text-muted-foreground mb-2">text</p>
              <Skeleton variant="text" className="w-3/4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">circular</p>
              <Skeleton variant="circular" width={48} height={48} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">rectangular</p>
              <Skeleton variant="rectangular" className="w-full h-24" />
            </div>
          </div>
        </PreviewBlock>

        <PreviewBlock title="SkeletonText" description="Multiple text lines">
          <div className="max-w-sm space-y-4">
            <SkeletonText lines={3} />
            <SkeletonText lines={5} />
          </div>
        </PreviewBlock>

        <PreviewBlock title="Skeleton Card (Composed Example)">
          <div className="max-w-sm border border-(--color-smoke) rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-1/2" />
                <Skeleton variant="text" className="w-1/3" />
              </div>
            </div>
            <SkeletonText lines={3} />
            <Skeleton variant="rectangular" className="w-full h-10 rounded-md" />
          </div>
        </PreviewBlock>
      </PreviewSection>

      <PreviewSection
        id="spinner"
        title="Spinner"
        description="Animated loading indicator."
      >
        <PreviewBlock title="Sizes">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Spinner size="sm" />
              <span className="text-xs text-muted-foreground">sm</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner size="md" />
              <span className="text-xs text-muted-foreground">md</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Spinner size="lg" />
              <span className="text-xs text-muted-foreground">lg</span>
            </div>
          </div>
        </PreviewBlock>

        <PreviewBlock title="Custom Colors">
          <div className="flex items-center gap-6">
            <Spinner size="md" color="#e31b1e" />
            <Spinner size="md" color="#f0b429" />
            <Spinner size="md" color="#00a86b" />
            <Spinner size="md" color="#2563eb" />
          </div>
        </PreviewBlock>
      </PreviewSection>
    </>
  );
}
