"use client";
import { useState } from "react";
import { Select } from "@/components/ui/forms/Select";
import type { SelectOption } from "@/components/ui/forms/Select";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

const LEVEL_OPTIONS: SelectOption[] = [
  { value: "1", label: "HSK Level 1" },
  { value: "2", label: "HSK Level 2" },
  { value: "3", label: "HSK Level 3" },
  { value: "4", label: "HSK Level 4" },
  { value: "5", label: "HSK Level 5" },
  { value: "6", label: "HSK Level 6" },
];

const ROLE_OPTIONS: SelectOption[] = [
  { value: "admin", label: "System Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student", disabled: true },
];

export default function SelectSection() {
  const [level, setLevel] = useState("");
  const [levelWithLabel, setLevelWithLabel] = useState("");
  const [role, setRole] = useState("");

  return (
    <PreviewSection
      id="select"
      title="Select"
      description="Dropdown selection control built with Radix UI."
    >
      <PreviewBlock title="Basic Select">
        <div className="max-w-sm space-y-4">
          <Select
            options={LEVEL_OPTIONS}
            value={level}
            onChange={setLevel}
            placeholder="Choose a level..."
          />
        </div>
      </PreviewBlock>

      <PreviewBlock title="With Label">
        <div className="max-w-sm space-y-4">
          <Select
            label="HSK Level"
            options={LEVEL_OPTIONS}
            value={levelWithLabel}
            onChange={setLevelWithLabel}
            placeholder="Select level..."
            required
          />
        </div>
      </PreviewBlock>

      <PreviewBlock title="With Error">
        <div className="max-w-sm">
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value=""
            onChange={() => {}}
            error="Please select a role"
          />
        </div>
      </PreviewBlock>

      <PreviewBlock title="With Disabled Option">
        <div className="max-w-sm">
          <Select
            label="Assign Role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={setRole}
            hint="Student role requires admin approval"
          />
        </div>
      </PreviewBlock>

      <PreviewBlock title="Disabled Select">
        <div className="max-w-sm">
          <Select
            label="Level (Disabled)"
            options={LEVEL_OPTIONS}
            value="3"
            onChange={() => {}}
            disabled
          />
        </div>
      </PreviewBlock>

      <PropsTable
        props={[
          {
            name: "options",
            type: "SelectOption[]",
            description: "Array of { value, label, disabled? } objects",
          },
          {
            name: "value",
            type: "string",
            description: "Currently selected value (controlled)",
          },
          {
            name: "onChange",
            type: "(value: string) => void",
            description: "Callback when selection changes",
          },
          {
            name: "label",
            type: "string",
            description: "Label rendered above the select",
          },
          {
            name: "error",
            type: "string",
            description: "Error message (adds red border)",
          },
          {
            name: "placeholder",
            type: "string",
            default: '"Select…"',
            description: "Placeholder text when no value is selected",
          },
          {
            name: "disabled",
            type: "boolean",
            default: "false",
            description: "Disables the select",
          },
        ]}
      />
    </PreviewSection>
  );
}
