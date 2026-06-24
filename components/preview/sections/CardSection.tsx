"use client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@/components/ui/primitives/Card";
import { Button } from "@/components/ui/primitives/Button";
import { Badge } from "@/components/ui/primitives/Badge";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function CardSection() {
  return (
    <PreviewSection
      id="card"
      title="Card"
      description="Container component for grouping related content."
    >
      <PreviewBlock title="Variants">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">default</p>
            <Card variant="default" padding="md">
              <p className="text-sm text-(--color-ink)">
                Default card with white background and subtle shadow.
              </p>
            </Card>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">paper</p>
            <Card variant="paper" padding="md">
              <p className="text-sm text-(--color-ink)">
                Paper card with warm off-white background.
              </p>
            </Card>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">ghost</p>
            <Card variant="ghost" padding="md">
              <p className="text-sm text-(--color-ink)">
                Ghost card with transparent background.
              </p>
            </Card>
          </div>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Padding Options">
        <div className="grid grid-cols-4 gap-4">
          {(["none", "sm", "md", "lg"] as const).map((p) => (
            <div key={p}>
              <p className="text-xs text-muted-foreground mb-2 font-mono">
                padding=&quot;{p}&quot;
              </p>
              <Card variant="default" padding={p}>
                <div className="bg-(--color-smoke) rounded text-xs text-(--color-ink) p-1 text-center">
                  Content
                </div>
              </Card>
            </div>
          ))}
        </div>
      </PreviewBlock>

      <PreviewBlock
        title="Full Card with Header, Body, Footer"
        description="Composed card layout"
      >
        <div className="max-w-sm">
          <Card variant="default" padding="none">
            <CardHeader className="px-5 pt-5">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold text-(--color-ink)">
                  HSK Level 3 Course
                </h4>
                <Badge variant="primary" size="sm">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Intermediate Chinese
              </p>
            </CardHeader>
            <CardBody className="px-5">
              <p className="text-sm text-(--color-ink)">
                Learn 600 essential vocabulary words and master complex
                sentence structures for daily conversations.
              </p>
            </CardBody>
            <CardFooter className="px-5 pb-5 flex gap-2">
              <Button size="sm">Enroll Now</Button>
              <Button variant="secondary" size="sm">
                Learn More
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PreviewBlock>

      <PropsTable
        props={[
          {
            name: "variant",
            type: '"default" | "paper" | "ghost"',
            default: '"default"',
            description: "Visual style of the card",
          },
          {
            name: "padding",
            type: '"none" | "sm" | "md" | "lg"',
            default: '"md"',
            description: "Internal padding of the card",
          },
          {
            name: "as",
            type: "ElementType",
            default: '"div"',
            description: "HTML element to render as",
          },
        ]}
      />
    </PreviewSection>
  );
}
