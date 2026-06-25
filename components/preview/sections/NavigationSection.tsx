"use client";
import { Breadcrumb } from "@/components/ui/navigation/Breadcrumb";
import { Pagination } from "@/components/ui/navigation/Pagination";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

export default function NavigationSection() {
  return (
    <>
      <PreviewSection
        id="breadcrumb"
        title="Breadcrumb"
        description="Hierarchical navigation trail."
      >
        <PreviewBlock title="2-item Breadcrumb">
          <Breadcrumb
            items={[
              { label: "Portal", href: "/portal/admin" },
              { label: "Students" },
            ]}
          />
        </PreviewBlock>

        <PreviewBlock title="3-item Breadcrumb">
          <Breadcrumb
            items={[
              { label: "Portal", href: "/portal/admin" },
              { label: "Courses", href: "/portal/admin/courses" },
              { label: "HSK Level 3" },
            ]}
          />
        </PreviewBlock>

        <PreviewBlock title="4-item Breadcrumb">
          <Breadcrumb
            items={[
              { label: "Portal", href: "/portal/admin" },
              { label: "Courses", href: "/portal/admin/courses" },
              { label: "HSK Level 3", href: "/portal/admin/courses/3" },
              { label: "Lesson 4: Numbers" },
            ]}
          />
        </PreviewBlock>

        <PropsTable
          props={[
            {
              name: "items",
              type: "BreadcrumbItemData[]",
              description:
                "Array of { label, href? } items. Last item is current page.",
            },
          ]}
        />
      </PreviewSection>

      <PreviewSection
        id="pagination"
        title="Pagination"
        description="Page navigation for large datasets."
      >
        <PreviewBlock title="Few Pages (3 total)">
          <Pagination
            currentPage={2}
            totalPages={3}
            baseUrl="/preview"
          />
        </PreviewBlock>

        <PreviewBlock title="Many Pages (20 total, on page 1)">
          <Pagination
            currentPage={1}
            totalPages={20}
            baseUrl="/preview"
          />
        </PreviewBlock>

        <PreviewBlock title="Many Pages (20 total, on page 10)">
          <Pagination
            currentPage={10}
            totalPages={20}
            baseUrl="/preview"
          />
        </PreviewBlock>

        <PreviewBlock title="Many Pages (20 total, on page 20)">
          <Pagination
            currentPage={20}
            totalPages={20}
            baseUrl="/preview"
          />
        </PreviewBlock>

        <PropsTable
          props={[
            {
              name: "currentPage",
              type: "number",
              description: "Currently active page (1-indexed)",
            },
            {
              name: "totalPages",
              type: "number",
              description: "Total number of pages",
            },
            {
              name: "baseUrl",
              type: "string",
              description:
                "Base URL; ?page=N is appended for each page link",
            },
            {
              name: "maxVisible",
              type: "number",
              default: "5",
              description: "Maximum number of page buttons to show",
            },
          ]}
        />
      </PreviewSection>
    </>
  );
}
