"use client";
import { Accordion } from "@/components/ui/navigation/Accordion";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function AccordionSection() {
  return (
    <PreviewSection
      id="accordion"
      title="Accordion"
      description="Collapsible content panels for progressive disclosure."
    >
      <PreviewBlock title="Basic Accordion">
        <Accordion
          items={[
            {
              title: "What is HSK?",
              content:
                "HSK (Hanyu Shuiping Kaoshi) is the standardized Chinese proficiency test for non-native speakers. It has 6 levels, ranging from beginner (HSK 1) to advanced (HSK 6).",
            },
            {
              title: "How long does it take to pass HSK 3?",
              content:
                "With consistent study of 1–2 hours per day, most students can prepare for HSK 3 in 3–6 months. The Ruby HSK program provides structured learning paths to reach this goal efficiently.",
            },
            {
              title: "What resources are available?",
              content:
                "Ruby HSK provides video lessons, vocabulary flashcards, practice tests, live tutoring sessions with certified teachers, and a progress tracking dashboard.",
            },
          ]}
        />
      </PreviewBlock>

      <PreviewBlock
        title="With Default Open Item"
        description="First item opens by default"
      >
        <Accordion
          items={[
            {
              title: "Course Structure",
              defaultOpen: true,
              content: (
                <div className="space-y-2">
                  <p>Each HSK course is structured into:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Introduction module (1 week)</li>
                    <li>Core vocabulary units (4–6 weeks)</li>
                    <li>Grammar and sentence patterns (2–3 weeks)</li>
                    <li>Mock examination (1 week)</li>
                  </ul>
                </div>
              ),
            },
            {
              title: "Certification",
              content:
                "Upon completing the course and passing the final assessment, students receive a Ruby HSK certificate. The official HSK exam must be taken separately at an authorized test center.",
            },
            {
              title: "Refund Policy",
              content:
                "Full refund is available within 7 days of enrollment if fewer than 20% of the course has been accessed. Contact support@ruby-hsk.vn for assistance.",
            },
          ]}
        />
      </PreviewBlock>

      <PreviewBlock title="Multiple Open Items">
        <Accordion
          items={[
            {
              title: "Topic 1: Greetings",
              defaultOpen: true,
              content: "Learn basic greetings: 你好, 再见, 谢谢, 不客气.",
            },
            {
              title: "Topic 2: Numbers",
              defaultOpen: true,
              content: "Master numbers 0–100: 零一二三四五六七八九十.",
            },
            {
              title: "Topic 3: Colors",
              content: "Learn colors: 红色, 蓝色, 绿色, 黄色, 白色, 黑色.",
            },
          ]}
        />
      </PreviewBlock>

      <PropsTable
        props={[
          {
            name: "items",
            type: "AccordionItemData[]",
            description: "Array of { title, content, defaultOpen? } items",
          },
        ]}
      />
    </PreviewSection>
  );
}
