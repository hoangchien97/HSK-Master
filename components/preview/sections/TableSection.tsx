"use client";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/data/Table";
import { Badge } from "@/components/ui/primitives/Badge";
import { Avatar } from "@/components/ui/primitives/Avatar";
import { Button } from "@/components/ui/primitives/Button";
import { Edit, Trash2 } from "lucide-react";
import { PreviewSection, PreviewBlock, PropsTable } from "../PreviewUtils";

const STUDENTS = [
  {
    id: "STU001",
    name: "Nguyễn Văn An",
    role: "STUDENT",
    level: "HSK 3",
    status: "Active",
    avatar: "https://i.pravatar.cc/64?img=1",
  },
  {
    id: "STU002",
    name: "Lê Thị Hương",
    role: "STUDENT",
    level: "HSK 2",
    status: "Active",
    avatar: "https://i.pravatar.cc/64?img=5",
  },
  {
    id: "TCH001",
    name: "Trần Minh Đức",
    role: "TEACHER",
    level: "HSK 6",
    status: "Active",
    avatar: "https://i.pravatar.cc/64?img=3",
  },
  {
    id: "STU003",
    name: "Phạm Thị Lan",
    role: "STUDENT",
    level: "HSK 1",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/64?img=9",
  },
  {
    id: "STU004",
    name: "Hoàng Quốc Bảo",
    role: "STUDENT",
    level: "HSK 4",
    status: "Active",
    avatar: "https://i.pravatar.cc/64?img=7",
  },
];

function getStatusVariant(
  status: string
): "success" | "default" | "warning" | "danger" {
  if (status === "Active") return "success";
  if (status === "Inactive") return "default";
  if (status === "Pending") return "warning";
  return "danger";
}

function getRoleVariant(role: string): "info" | "primary" | "default" {
  if (role === "TEACHER") return "primary";
  if (role === "STUDENT") return "info";
  return "default";
}

export default function TableSection() {
  return (
    <PreviewSection
      id="table"
      title="Table"
      description="Data table components for displaying structured information."
    >
      <PreviewBlock
        title="Student / User Table"
        description="Full table with avatars, badges, and action buttons"
      >
        <Table>
          <TableHeader>
            <tr>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {STUDENTS.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <span className="font-mono text-xs text-muted-foreground">
                    {student.id}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={student.avatar}
                      name={student.name}
                      size="sm"
                    />
                    <span className="font-medium text-(--color-ink)">
                      {student.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(student.role)} size="sm">
                    {student.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-(--color-ink)">
                    {student.level}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(student.status)}
                    size="sm"
                  >
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Edit size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PreviewBlock>

      <PreviewBlock title="Simple Data Table" description="Minimal table example">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Vocabulary</TableHead>
              <TableHead>Pinyin</TableHead>
              <TableHead>Meaning</TableHead>
              <TableHead>Level</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {[
              { word: "你好", pinyin: "nǐ hǎo", meaning: "Hello", level: "HSK 1" },
              { word: "谢谢", pinyin: "xiè xiè", meaning: "Thank you", level: "HSK 1" },
              { word: "学习", pinyin: "xué xí", meaning: "To study", level: "HSK 2" },
              { word: "工作", pinyin: "gōng zuò", meaning: "Work / Job", level: "HSK 2" },
              { word: "朋友", pinyin: "péng yǒu", meaning: "Friend", level: "HSK 2" },
            ].map((row) => (
              <TableRow key={row.word}>
                <TableCell>
                  <span className="font-medium text-xl text-(--color-ink)">
                    {row.word}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground italic">
                    {row.pinyin}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-(--color-ink)">{row.meaning}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="info" size="sm">
                    {row.level}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PreviewBlock>

      <PropsTable
        props={[
          {
            name: "Table",
            type: "TableHTMLAttributes",
            description: "Root table wrapper with overflow-x-auto",
          },
          {
            name: "TableHeader",
            type: "HTMLAttributes<HTMLTableSectionElement>",
            description: "thead with paper background",
          },
          {
            name: "TableHead",
            type: "ThHTMLAttributes",
            description: "th — uppercase, muted foreground, tracking",
          },
          {
            name: "TableBody",
            type: "HTMLAttributes<HTMLTableSectionElement>",
            description: "tbody with row dividers",
          },
          {
            name: "TableRow",
            type: "HTMLAttributes<HTMLTableRowElement>",
            description: "tr with hover:paper background",
          },
          {
            name: "TableCell",
            type: "TdHTMLAttributes",
            description: "td with standard padding",
          },
        ]}
      />
    </PreviewSection>
  );
}
