"use client";
import { Button } from "@/components/ui/primitives/Button";
import { Plus, ChevronRight, Search } from "lucide-react";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function ButtonSection() {
  return (
    <PreviewSection
      id="button"
      title="Button"
      description="Primary interactive element for triggering actions."
    >
      <PreviewBlock
        title="Variants"
        description="Four visual styles for different semantic meanings"
      >
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </PreviewBlock>

      <PreviewBlock title="Sizes" description="Three size options">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </PreviewBlock>

      <PreviewBlock
        title="States"
        description="Loading and disabled states"
      >
        <div className="flex flex-wrap gap-3">
          <Button isLoading>Loading</Button>
          <Button isDisabled>Disabled</Button>
          <Button variant="secondary" isLoading>
            Loading Secondary
          </Button>
          <Button variant="danger" isDisabled>
            Disabled Danger
          </Button>
        </div>
      </PreviewBlock>

      <PreviewBlock title="With Icons" description="Left and right icon slots">
        <div className="flex flex-wrap gap-3">
          <Button leftIcon={<Plus size={16} />}>Add Item</Button>
          <Button rightIcon={<ChevronRight size={16} />} variant="secondary">
            Continue
          </Button>
          <Button
            leftIcon={<Search size={16} />}
            rightIcon={<ChevronRight size={16} />}
            variant="ghost"
          >
            Search
          </Button>
          <Button variant="danger" leftIcon={<Plus size={16} />} size="sm">
            Small Icon
          </Button>
        </div>
      </PreviewBlock>

      <PropsTable
        props={[
          {
            name: "variant",
            type: '"primary" | "secondary" | "ghost" | "danger"',
            default: '"primary"',
            description: "Visual style of the button",
          },
          {
            name: "size",
            type: '"sm" | "md" | "lg"',
            default: '"md"',
            description: "Size of the button",
          },
          {
            name: "isLoading",
            type: "boolean",
            default: "false",
            description: "Shows a loading spinner and disables interaction",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Disables the button",
          },
          {
            name: "leftIcon",
            type: "ReactNode",
            default: "—",
            description: "Icon rendered on the left side",
          },
          {
            name: "rightIcon",
            type: "ReactNode",
            default: "—",
            description: "Icon rendered on the right side",
          },
        ]}
      />
    </PreviewSection>
  );
}
