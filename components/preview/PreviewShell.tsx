"use client";
import { useState } from "react";
import PreviewSidebar from "./PreviewSidebar";
import SystemDesign from "./sections/SystemDesign";
import ButtonSection from "./sections/ButtonSection";
import BadgeSection from "./sections/BadgeSection";
import AvatarSection from "./sections/AvatarSection";
import CardSection from "./sections/CardSection";
import DisplaySection from "./sections/DisplaySection";
import InputSection from "./sections/InputSection";
import SelectSection from "./sections/SelectSection";
import ToggleSection from "./sections/ToggleSection";
import ModalSection from "./sections/ModalSection";
import PopoverSection from "./sections/PopoverSection";
import TabsSection from "./sections/TabsSection";
import AccordionSection from "./sections/AccordionSection";
import NavigationSection from "./sections/NavigationSection";
import TableSection from "./sections/TableSection";

const SECTIONS: Record<string, React.ComponentType<{ activeId?: string }>> = {
  colors: SystemDesign,
  typography: SystemDesign,
  "hsk-levels": SystemDesign,
  button: ButtonSection,
  badge: BadgeSection,
  avatar: AvatarSection,
  card: CardSection,
  display: DisplaySection,
  input: InputSection,
  select: SelectSection,
  toggle: ToggleSection,
  modal: ModalSection,
  popover: PopoverSection,
  tabs: TabsSection,
  accordion: AccordionSection,
  nav: NavigationSection,
  table: TableSection,
};

export default function PreviewShell() {
  const [activeId, setActiveId] = useState("colors");
  const ActiveSection = SECTIONS[activeId] ?? SystemDesign;

  return (
    <div className="flex flex-col h-screen bg-(--color-paper)">
      {/* Topbar */}
      <header className="shrink-0 bg-(--color-ink) text-white px-6 py-3 flex items-center gap-3">
        <span className="text-lg">🎨</span>
        <span className="font-semibold text-base tracking-tight">
          Ruby HSK — Design System
        </span>
        <span className="ml-auto text-xs text-white/50">Component Library</span>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <PreviewSidebar activeId={activeId} onSelect={setActiveId} />
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <ActiveSection activeId={activeId} />
        </main>
      </div>
    </div>
  );
}
