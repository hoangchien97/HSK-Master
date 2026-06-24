"use client";
import { useState } from "react";
import { Dropdown } from "@/components/ui/overlays/Dropdown";
import type { DropdownItem } from "@/components/ui/overlays/Dropdown";
import { Tooltip } from "@/components/ui/overlays/Tooltip";
import { Popover } from "@/components/ui/overlays/Popover";
import { Button } from "@/components/ui/primitives/Button";
import {
  Settings,
  Trash2,
  Edit,
  User,
  ChevronDown,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { PreviewSection, PreviewBlock } from "../PreviewUtils";

const BASIC_ITEMS: DropdownItem[] = [
  { label: "View Profile", icon: <User size={14} /> },
  { label: "Edit", icon: <Edit size={14} /> },
  { label: "Settings", icon: <Settings size={14} /> },
  { divider: true, label: "", onClick: undefined },
  { label: "Delete", icon: <Trash2 size={14} />, onClick: undefined },
];

const COURSE_ITEMS: DropdownItem[] = [
  { label: "HSK 1 Course", icon: <BookOpen size={14} /> },
  { label: "HSK 2 Course", icon: <BookOpen size={14} /> },
  { label: "HSK 3 Course", icon: <BookOpen size={14} /> },
  { divider: true, label: "", onClick: undefined },
  {
    label: "Advanced Courses",
    icon: <GraduationCap size={14} />,
    disabled: true,
  },
];

export default function PopoverSection() {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <>
      <PreviewSection
        id="popover"
        title="Dropdown"
        description="Context menu triggered by any element."
      >
        <PreviewBlock title="Basic Dropdown">
          <div className="flex flex-wrap gap-3">
            <Dropdown
              trigger={
                <Button variant="secondary" rightIcon={<ChevronDown size={14} />}>
                  Actions
                </Button>
              }
              items={BASIC_ITEMS}
            />
            <Dropdown
              trigger={
                <Button variant="primary" rightIcon={<ChevronDown size={14} />}>
                  Courses
                </Button>
              }
              items={COURSE_ITEMS}
              align="start"
            />
            <Dropdown
              trigger={
                <Button variant="ghost">
                  <Settings size={16} />
                </Button>
              }
              items={[
                { label: "Account Settings", icon: <Settings size={14} /> },
                { label: "Profile", icon: <User size={14} /> },
                { divider: true, label: "", onClick: undefined },
                { label: "Sign Out", icon: <Trash2 size={14} /> },
              ]}
            />
          </div>
        </PreviewBlock>
      </PreviewSection>

      <PreviewSection
        id="tooltip"
        title="Tooltip"
        description="Contextual information on hover."
      >
        <PreviewBlock
          title="All Placements"
          description="Hover each button to see the tooltip"
        >
          <div className="flex flex-wrap gap-3 justify-center py-4">
            <Tooltip content="Tooltip on top" placement="top">
              <Button variant="secondary" size="sm">
                Top
              </Button>
            </Tooltip>
            <Tooltip content="Tooltip on bottom" placement="bottom">
              <Button variant="secondary" size="sm">
                Bottom
              </Button>
            </Tooltip>
            <Tooltip content="Tooltip on left" placement="left">
              <Button variant="secondary" size="sm">
                Left
              </Button>
            </Tooltip>
            <Tooltip content="Tooltip on right" placement="right">
              <Button variant="secondary" size="sm">
                Right
              </Button>
            </Tooltip>
          </div>
        </PreviewBlock>

        <PreviewBlock title="Rich Tooltip Content">
          <div className="flex flex-wrap gap-3">
            <Tooltip
              content={
                <span>
                  HSK Level 3: <strong>600 words</strong>
                </span>
              }
              placement="top"
            >
              <Button variant="secondary" size="sm">
                Rich Content
              </Button>
            </Tooltip>
            <Tooltip
              content="Instant tooltip (no delay)"
              placement="top"
              delayMs={0}
            >
              <Button variant="secondary" size="sm">
                No Delay
              </Button>
            </Tooltip>
          </div>
        </PreviewBlock>
      </PreviewSection>

      <PreviewSection
        id="popover-component"
        title="Popover"
        description="Floating content panel triggered by a button."
      >
        <PreviewBlock title="Basic Popover">
          <div className="flex flex-wrap gap-3">
            <Popover
              trigger={
                <Button variant="secondary">Open Popover</Button>
              }
              side="bottom"
              align="start"
            >
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-(--color-ink)">
                  Filter Options
                </h4>
                <p className="text-xs text-muted-foreground">
                  Adjust the filters to refine your search results.
                </p>
                <div className="pt-1">
                  <Button size="sm" className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Popover>

            <Popover
              trigger={
                <Button variant="secondary">Popover with Close</Button>
              }
              showCloseButton
              side="bottom"
            >
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-(--color-ink)">
                  Quick Actions
                </h4>
                <p className="text-xs text-muted-foreground">
                  Select an action to perform on the selected items.
                </p>
              </div>
            </Popover>

            <Popover
              trigger={
                <Button variant="secondary">Controlled Popover</Button>
              }
              isOpen={popoverOpen}
              onOpenChange={setPopoverOpen}
              side="right"
            >
              <div className="space-y-2">
                <p className="text-sm text-(--color-ink)">
                  Controlled: open={String(popoverOpen)}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPopoverOpen(false)}
                >
                  Close
                </Button>
              </div>
            </Popover>
          </div>
        </PreviewBlock>
      </PreviewSection>
    </>
  );
}
