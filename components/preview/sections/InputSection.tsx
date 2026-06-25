"use client";
import { useState } from "react";
import { Input } from "@/components/ui/forms/Input";
import { Textarea } from "@/components/ui/forms/Textarea";
import { Label } from "@/components/ui/forms/Label";
import { Search, Mail, Eye } from "lucide-react";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function InputSection() {
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [bioWithCount, setBioWithCount] = useState("");

  return (
    <>
      <PreviewSection
        id="input"
        title="Input"
        description="Text input fields with icons, labels, and validation states."
      >
        <PreviewBlock title="Basic Input">
          <div className="max-w-sm space-y-4">
            <Input
              placeholder="Basic input"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Input label="With Label" placeholder="Enter text..." />
            <Input
              label="Required Field"
              placeholder="Required input"
              required
            />
          </div>
        </PreviewBlock>

        <PreviewBlock title="Validation States">
          <div className="max-w-sm space-y-4">
            <Input
              label="With Error"
              value="invalid@"
              error="Please enter a valid email address"
              onChange={() => {}}
            />
            <Input
              label="With Hint"
              placeholder="Enter username"
              hint="Username must be 3–20 characters"
            />
          </div>
        </PreviewBlock>

        <PreviewBlock title="With Icons">
          <div className="max-w-sm space-y-4">
            <Input
              label="Left Icon"
              placeholder="Search..."
              leftIcon={<Search size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Right Icon"
              placeholder="Enter email"
              rightIcon={<Mail size={16} />}
            />
            <Input
              label="Both Icons"
              placeholder="Search users..."
              leftIcon={<Search size={16} />}
              rightIcon={<Eye size={16} />}
            />
          </div>
        </PreviewBlock>

        <PreviewBlock title="Password Input" description="Built-in show/hide toggle">
          <div className="max-w-sm">
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
            />
          </div>
        </PreviewBlock>

        <PropsTable
          props={[
            {
              name: "label",
              type: "string",
              description: "Label rendered above the input",
            },
            {
              name: "error",
              type: "string",
              description: "Error message shown below (adds red border)",
            },
            {
              name: "hint",
              type: "string",
              description: "Hint text shown below (when no error)",
            },
            {
              name: "leftIcon",
              type: "ReactNode",
              description: "Icon shown on the left",
            },
            {
              name: "rightIcon",
              type: "ReactNode",
              description: "Icon shown on the right (auto password toggle for type=password)",
            },
          ]}
        />
      </PreviewSection>

      <PreviewSection
        id="textarea"
        title="Textarea"
        description="Multi-line text input."
      >
        <PreviewBlock title="Basic">
          <div className="max-w-sm space-y-4">
            <Textarea
              placeholder="Enter your message..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <Textarea
              label="With Label"
              placeholder="Write something..."
            />
            <Textarea
              label="Required"
              placeholder="Required textarea"
              required
            />
          </div>
        </PreviewBlock>

        <PreviewBlock title="Validation States">
          <div className="max-w-sm space-y-4">
            <Textarea
              label="With Error"
              value="Too short"
              error="Description must be at least 50 characters"
              onChange={() => {}}
            />
            <Textarea
              label="With Hint"
              placeholder="Describe your experience..."
              hint="Optional: share details about your learning journey"
            />
          </div>
        </PreviewBlock>

        <PreviewBlock
          title="With Character Count"
          description="showCount + maxLength"
        >
          <div className="max-w-sm">
            <Textarea
              label="Bio"
              placeholder="Tell us about yourself..."
              maxLength={200}
              showCount
              value={bioWithCount}
              onChange={(e) => setBioWithCount(e.target.value)}
            />
          </div>
        </PreviewBlock>
      </PreviewSection>

      <PreviewSection
        id="label"
        title="Label"
        description="Form label with optional required indicator."
      >
        <PreviewBlock title="Label Variants">
          <div className="space-y-3">
            <Label>Standard Label</Label>
            <Label required>Required Label</Label>
            <div className="space-y-1">
              <Label htmlFor="demo-input" required>
                Attached Label
              </Label>
              <Input id="demo-input" placeholder="Input with attached label" />
            </div>
          </div>
        </PreviewBlock>
      </PreviewSection>
    </>
  );
}
