"use client";
import { PreviewSection, PreviewBlock } from "../PreviewUtils";

const BRAND_COLORS = [
  { name: "--color-vermillion", hex: "#e31b1e", label: "Vermillion" },
  { name: "--color-vermillion-hover", hex: "#c91018", label: "Vermillion Hover" },
  { name: "--color-gold", hex: "#f0b429", label: "Gold" },
  { name: "--color-ink", hex: "#1c0e0f", label: "Ink" },
  { name: "--color-paper", hex: "#faf8f5", label: "Paper" },
  { name: "--color-surface", hex: "#ffffff", label: "Surface" },
  { name: "--color-smoke", hex: "#ede9e5", label: "Smoke" },
  { name: "--color-chinese-red", hex: "#dc143c", label: "Chinese Red" },
  { name: "--color-chinese-gold", hex: "#ffd700", label: "Chinese Gold" },
  { name: "--color-chinese-jade", hex: "#00a86b", label: "Chinese Jade" },
];

const PRIMARY_SCALE = [
  { name: "primary-50", hex: "#fef2f2" },
  { name: "primary-100", hex: "#fee2e2" },
  { name: "primary-200", hex: "#fecaca" },
  { name: "primary-300", hex: "#fca5a5" },
  { name: "primary-400", hex: "#f87171" },
  { name: "primary-500", hex: "#ef4444" },
  { name: "primary-600", hex: "#ec131e" },
  { name: "primary-700", hex: "#b91c1c" },
  { name: "primary-800", hex: "#991b1b" },
  { name: "primary-900", hex: "#7f1d1d" },
  { name: "primary-950", hex: "#450a0a" },
];

const TYPE_SCALE = [
  { name: "text-xs", size: "0.75rem", sample: "Extra Small — 12px" },
  { name: "text-sm", size: "0.875rem", sample: "Small — 14px" },
  { name: "text-base", size: "1rem", sample: "Base — 16px" },
  { name: "text-lg", size: "1.125rem", sample: "Large — 18px" },
  { name: "text-xl", size: "1.25rem", sample: "XL — 20px" },
  { name: "text-2xl", size: "1.5rem", sample: "2XL — 24px" },
  { name: "text-3xl", size: "1.875rem", sample: "3XL — 30px" },
  { name: "text-4xl", size: "2.25rem", sample: "4XL — 36px" },
];

const HSK_LEVELS = [
  { level: 1, color: "#16a34a", label: "HSK 1" },
  { level: 2, color: "#0891b2", label: "HSK 2" },
  { level: 3, color: "#2563eb", label: "HSK 3" },
  { level: 4, color: "#7c3aed", label: "HSK 4" },
  { level: 5, color: "#d97706", label: "HSK 5" },
  { level: 6, color: "#e31b1e", label: "HSK 6" },
];

interface Props {
  activeId?: string;
}

export default function SystemDesign({ activeId = "colors" }: Props) {
  return (
    <div>
      {(activeId === "colors" || activeId === "typography" || activeId === "hsk-levels") && (
        <>
          <PreviewSection
            id="colors"
            title="Brand Colors"
            description="Core design tokens defined as CSS custom properties in globals.css"
          >
            <PreviewBlock title="Brand Palette">
              <div className="flex flex-wrap gap-4">
                {BRAND_COLORS.map((c) => (
                  <div key={c.name} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-16 h-16 rounded-lg border border-(--color-smoke) shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs font-medium text-(--color-ink) text-center">
                      {c.label}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {c.hex}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono text-center leading-tight max-w-[72px]">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </PreviewBlock>

            <PreviewBlock title="Primary Scale">
              <div className="flex flex-wrap gap-3">
                {PRIMARY_SCALE.map((c) => (
                  <div key={c.name} className="flex flex-col items-center gap-1">
                    <div
                      className="w-12 h-12 rounded-md border border-(--color-smoke)"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {c.hex}
                    </span>
                  </div>
                ))}
              </div>
            </PreviewBlock>
          </PreviewSection>

          <PreviewSection
            id="typography"
            title="Typography"
            description="Type scale and font families used throughout the application"
          >
            <PreviewBlock title="Font Families">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground font-mono block mb-1">
                    font-sans (Inter / system-ui)
                  </span>
                  <p className="text-2xl text-(--color-ink)">
                    The quick brown fox jumps over the lazy dog
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-mono block mb-1">
                    font-mono
                  </span>
                  <p className="text-2xl font-mono text-(--color-ink)">
                    const greeting = &quot;你好&quot;;
                  </p>
                </div>
              </div>
            </PreviewBlock>

            <PreviewBlock title="Type Scale">
              <div className="space-y-3">
                {TYPE_SCALE.map((t) => (
                  <div key={t.name} className="flex items-baseline gap-4">
                    <span className="text-xs font-mono text-muted-foreground w-20 shrink-0">
                      {t.name}
                    </span>
                    <span className="text-xs font-mono text-blue-600 w-16 shrink-0">
                      {t.size}
                    </span>
                    <span
                      className={`${t.name} text-(--color-ink)`}
                      style={{ fontSize: t.size }}
                    >
                      {t.sample}
                    </span>
                  </div>
                ))}
              </div>
            </PreviewBlock>

            <PreviewBlock title="Font Weights">
              <div className="space-y-2">
                {[
                  { w: "font-normal", label: "Normal (400)" },
                  { w: "font-medium", label: "Medium (500)" },
                  { w: "font-semibold", label: "Semibold (600)" },
                  { w: "font-bold", label: "Bold (700)" },
                ].map((fw) => (
                  <p
                    key={fw.w}
                    className={`text-lg text-(--color-ink) ${fw.w}`}
                  >
                    {fw.label} — 汉语水平考试
                  </p>
                ))}
              </div>
            </PreviewBlock>
          </PreviewSection>

          <PreviewSection
            id="hsk-levels"
            title="HSK Level Colors"
            description="Color system for HSK difficulty levels 1–6"
          >
            <PreviewBlock title="Level Palette">
              <div className="flex flex-wrap gap-6">
                {HSK_LEVELS.map((l) => (
                  <div key={l.level} className="flex flex-col items-center gap-2">
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md"
                      style={{ backgroundColor: l.color }}
                    >
                      {l.level}
                    </div>
                    <span className="text-sm font-semibold text-(--color-ink)">
                      {l.label}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {l.color}
                    </span>
                  </div>
                ))}
              </div>
            </PreviewBlock>

            <PreviewBlock title="Level Badges">
              <div className="flex flex-wrap gap-3">
                {HSK_LEVELS.map((l) => (
                  <span
                    key={l.level}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-semibold"
                    style={{ backgroundColor: l.color }}
                  >
                    HSK {l.level}
                  </span>
                ))}
              </div>
            </PreviewBlock>
          </PreviewSection>
        </>
      )}
    </div>
  );
}
