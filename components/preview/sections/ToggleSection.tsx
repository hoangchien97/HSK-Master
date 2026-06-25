"use client";
import { useState } from "react";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import { RadioGroup } from "@/components/ui/forms/Radio";
import { Switch } from "@/components/ui/forms/Switch";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function ToggleSection() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [radio1, setRadio1] = useState("hsk3");
  const [radio2, setRadio2] = useState("teacher");
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(true);

  return (
    <>
      <PreviewSection
        id="toggle"
        title="Checkbox"
        description="Boolean toggle with label and description support."
      >
        <PreviewBlock title="States">
          <div className="space-y-3">
            <Checkbox
              label="Unchecked"
              checked={checked1}
              onCheckedChange={(v) => setChecked1(v === true)}
            />
            <Checkbox
              label="Checked"
              checked={checked2}
              onCheckedChange={(v) => setChecked2(v === true)}
            />
            <Checkbox
              label="With Description"
              description="Subscribe to receive weekly lesson updates via email"
              checked={false}
              onCheckedChange={() => {}}
            />
            <Checkbox
              label="With Error"
              error="You must accept the terms to continue"
              checked={false}
              onCheckedChange={() => {}}
            />
            <Checkbox
              label="Disabled (unchecked)"
              disabled
            />
            <Checkbox
              label="Disabled (checked)"
              checked
              disabled
            />
          </div>
        </PreviewBlock>

        <PropsTable
          props={[
            {
              name: "label",
              type: "string",
              description: "Label text next to the checkbox",
            },
            {
              name: "description",
              type: "string",
              description: "Supporting description text",
            },
            {
              name: "error",
              type: "string",
              description: "Error message shown below",
            },
            {
              name: "checked",
              type: 'boolean | "indeterminate"',
              description: "Controlled checked state",
            },
            {
              name: "onCheckedChange",
              type: '(checked: boolean | "indeterminate") => void',
              description: "Callback when value changes",
            },
            {
              name: "disabled",
              type: "boolean",
              default: "false",
              description: "Disables the checkbox",
            },
          ]}
        />
      </PreviewSection>

      <PreviewSection
        id="radio"
        title="RadioGroup"
        description="Single-select group of radio buttons."
      >
        <PreviewBlock title="Vertical (default)">
          <RadioGroup
            name="hsk-level-v"
            value={radio1}
            onValueChange={setRadio1}
            items={[
              { value: "hsk1", label: "HSK Level 1", description: "150 vocabulary words" },
              { value: "hsk2", label: "HSK Level 2", description: "300 vocabulary words" },
              { value: "hsk3", label: "HSK Level 3", description: "600 vocabulary words" },
              { value: "hsk4", label: "HSK Level 4 (disabled)", disabled: true },
            ]}
          />
        </PreviewBlock>

        <PreviewBlock title="Horizontal">
          <RadioGroup
            name="role-h"
            value={radio2}
            onValueChange={setRadio2}
            orientation="horizontal"
            items={[
              { value: "admin", label: "Admin" },
              { value: "teacher", label: "Teacher" },
              { value: "student", label: "Student" },
            ]}
          />
        </PreviewBlock>
      </PreviewSection>

      <PreviewSection
        id="switch"
        title="Switch"
        description="Toggle for binary on/off states."
      >
        <PreviewBlock title="States">
          <div className="space-y-4">
            <Switch
              label="Notifications off"
              checked={switch1}
              onCheckedChange={setSwitch1}
            />
            <Switch
              label="Notifications on"
              checked={switch2}
              onCheckedChange={setSwitch2}
            />
            <Switch
              label="Email Updates"
              description="Receive weekly lesson summaries via email"
              checked={switch3}
              onCheckedChange={setSwitch3}
            />
            <Switch
              label="Disabled (off)"
              checked={false}
              disabled
            />
            <Switch
              label="Disabled (on)"
              checked
              disabled
            />
          </div>
        </PreviewBlock>

        <PropsTable
          props={[
            {
              name: "label",
              type: "string",
              description: "Label text next to the switch",
            },
            {
              name: "description",
              type: "string",
              description: "Supporting description text",
            },
            {
              name: "checked",
              type: "boolean",
              description: "Controlled checked state",
            },
            {
              name: "onCheckedChange",
              type: "(checked: boolean) => void",
              description: "Callback when value changes",
            },
            {
              name: "disabled",
              type: "boolean",
              default: "false",
              description: "Disables the switch",
            },
          ]}
        />
      </PreviewSection>
    </>
  );
}
