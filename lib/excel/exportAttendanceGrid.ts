/**
 * Export Attendance Grid to Excel (.xlsx)
 *
 * Generates an Excel file matching the UI attendance grid layout:
 * - Fixed columns: STT, HỌC VIÊN
 * - Date columns with DD/MM + weekday headers
 * - Per-student present/absent counts
 * - Footer summary row
 */

import ExcelJS from 'exceljs';
import {
  formatDateDDMM,
  weekdayLabelVI,
  formatExportDateDisplay,
} from './attendance-utils';

/* ───────────────── Types ───────────────── */

export interface ExportStudent {
  id: string;
  name: string;
  studentCode?: string | null;
}

export interface ExportSchedule {
  id: string;
  date: string; // YYYY-MM-DD
}

export interface ExportAttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: string; // PRESENT | ABSENT
}

export interface ExportAttendanceInput {
  className: string;
  students: ExportStudent[];
  schedules: ExportSchedule[];
  attendanceRecords: ExportAttendanceRecord[];
  timezone?: string;
}

/* ───────────────── Constants ───────────────── */

const HEADER_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF3F4F6' }, // gray-100
};

const TITLE_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFDBEAFE' }, // blue-100
};

const FOOTER_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF9FAFB' }, // gray-50
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

const GREEN_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FF059669' }, bold: true };
const RED_FONT: Partial<ExcelJS.Font> = { color: { argb: 'FFDC2626' }, bold: true };

/* ───────────────── Main Export Function ───────────────── */

export async function exportAttendanceGrid(input: ExportAttendanceInput): Promise<Buffer> {
  const { className, students, schedules, attendanceRecords, timezone = 'Asia/Ho_Chi_Minh' } = input;

  // Sort schedules by date
  const sortedSchedules = [...schedules].sort((a, b) => a.date.localeCompare(b.date));

  // Build lookup maps
  const attendanceMap = new Map<string, string>(); // "studentId__date" => status
  for (const record of attendanceRecords) {
    attendanceMap.set(`${record.studentId}__${record.date}`, record.status);
  }

  // Determine column layout
  const hasStudentCode = students.some((s) => s.studentCode);
  const fixedCols = hasStudentCode ? 3 : 2; // STT, HỌC VIÊN, [MSHV]
  const dateColStart = fixedCols + 1; // 1-based Excel column index
  const totalCols = fixedCols + sortedSchedules.length + 2; // +2 for TỔNG CÓ MẶT, TỔNG VẮNG

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HSK Portal';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('DiemDanh', {
    views: [
      {
        state: 'frozen',
        xSplit: fixedCols,
        ySplit: 5,
        topLeftCell: `${colLetter(fixedCols + 1)}6`,
        activeCell: 'A1',
      },
    ],
  });

  // ── Row 1: Title ──
  const titleRow = sheet.getRow(1);
  sheet.mergeCells(1, 1, 1, totalCols);
  const titleCell = titleRow.getCell(1);
  titleCell.value = `ĐIỂM DANH - ${className}`;
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF1E3A5F' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = TITLE_FILL;
  titleRow.height = 30;

  // ── Row 2: Export date ──
  const dateRow = sheet.getRow(2);
  sheet.mergeCells(2, 1, 2, totalCols);
  const dateCell = dateRow.getCell(1);
  dateCell.value = `Ngày export: ${formatExportDateDisplay(timezone)}`;
  dateCell.font = { italic: true, size: 10, color: { argb: 'FF6B7280' } };
  dateCell.alignment = { horizontal: 'center' };

  // ── Row 3: Summary info ──
  const infoRow = sheet.getRow(3);
  sheet.mergeCells(3, 1, 3, totalCols);
  const infoCell = infoRow.getCell(1);
  infoCell.value = `Số buổi (hiển thị): ${sortedSchedules.length} | Số học viên: ${students.length}`;
  infoCell.font = { size: 10, color: { argb: 'FF6B7280' } };
  infoCell.alignment = { horizontal: 'center' };

  // ── Row 4: spacer ──
  sheet.getRow(4).height = 6;

  // ── Row 5: Header row ──
  const headerRow = sheet.getRow(5);
  headerRow.height = 36;

  let col = 1;

  // STT
  setHeaderCell(headerRow.getCell(col), 'STT');
  sheet.getColumn(col).width = 6;
  col++;

  // HỌC VIÊN
  setHeaderCell(headerRow.getCell(col), 'HỌC VIÊN');
  sheet.getColumn(col).width = 28;
  col++;

  // MSHV (optional)
  if (hasStudentCode) {
    setHeaderCell(headerRow.getCell(col), 'MSHV');
    sheet.getColumn(col).width = 14;
    col++;
  }

  // Date columns
  for (const schedule of sortedSchedules) {
    const headerText = `${formatDateDDMM(schedule.date)}\n${weekdayLabelVI(schedule.date)}`;
    const cell = headerRow.getCell(col);
    setHeaderCell(cell, headerText);
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    sheet.getColumn(col).width = 9;
    col++;
  }

  // TỔNG CÓ MẶT
  setHeaderCell(headerRow.getCell(col), 'TỔNG\nCÓ MẶT');
  headerRow.getCell(col).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.getCell(col).font = { ...headerRow.getCell(col).font, ...GREEN_FONT, size: 10 };
  sheet.getColumn(col).width = 12;
  col++;

  // TỔNG VẮNG
  setHeaderCell(headerRow.getCell(col), 'TỔNG\nVẮNG');
  headerRow.getCell(col).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  headerRow.getCell(col).font = { ...headerRow.getCell(col).font, ...RED_FONT, size: 10 };
  sheet.getColumn(col).width = 12;

  // ── Body rows ──
  const EVEN_FILL: ExcelJS.FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' },
  };
  const ODD_FILL: ExcelJS.FillPattern = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF9FAFB' },
  };

  // Column-level summaries
  const columnPresentCounts = new Array(sortedSchedules.length).fill(0);
  const columnAbsentCounts = new Array(sortedSchedules.length).fill(0);
  let overallPresent = 0;
  let overallAbsent = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const rowNum = 6 + i;
    const row = sheet.getRow(rowNum);
    const rowFill = i % 2 === 0 ? EVEN_FILL : ODD_FILL;

    let c = 1;

    // STT
    const sttCell = row.getCell(c);
    sttCell.value = String(i + 1).padStart(2, '0');
    sttCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sttCell.font = { size: 10, color: { argb: 'FF6B7280' } };
    sttCell.fill = rowFill;
    sttCell.border = THIN_BORDER;
    c++;

    // HỌC VIÊN
    const nameCell = row.getCell(c);
    nameCell.value = student.name;
    nameCell.font = { size: 10 };
    nameCell.alignment = { vertical: 'middle' };
    nameCell.fill = rowFill;
    nameCell.border = THIN_BORDER;
    c++;

    // MSHV
    if (hasStudentCode) {
      const codeCell = row.getCell(c);
      codeCell.value = student.studentCode || '';
      codeCell.font = { size: 9, color: { argb: 'FF9CA3AF' } };
      codeCell.alignment = { horizontal: 'center', vertical: 'middle' };
      codeCell.fill = rowFill;
      codeCell.border = THIN_BORDER;
      c++;
    }

    // Date cells
    let studentPresent = 0;
    let studentAbsent = 0;

    for (let j = 0; j < sortedSchedules.length; j++) {
      const schedule = sortedSchedules[j];
      const key = `${student.id}__${schedule.date}`;
      const status = attendanceMap.get(key);
      const cell = row.getCell(c);

      if (status === 'PRESENT') {
        cell.value = '✓';
        cell.font = { ...GREEN_FONT, size: 12 };
        studentPresent++;
        columnPresentCounts[j]++;
        overallPresent++;
      } else if (status === 'ABSENT') {
        cell.value = '✗';
        cell.font = { ...RED_FONT, size: 12 };
        studentAbsent++;
        columnAbsentCounts[j]++;
        overallAbsent++;
      } else {
        cell.value = '';
      }

      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = rowFill;
      cell.border = THIN_BORDER;
      c++;
    }

    // TỔNG CÓ MẶT
    const presentCell = row.getCell(c);
    presentCell.value = studentPresent;
    presentCell.font = { ...GREEN_FONT, size: 10 };
    presentCell.alignment = { horizontal: 'center', vertical: 'middle' };
    presentCell.fill = rowFill;
    presentCell.border = THIN_BORDER;
    c++;

    // TỔNG VẮNG
    const absentCell = row.getCell(c);
    absentCell.value = studentAbsent;
    absentCell.font = { ...RED_FONT, size: 10 };
    absentCell.alignment = { horizontal: 'center', vertical: 'middle' };
    absentCell.fill = rowFill;
    absentCell.border = THIN_BORDER;
  }

  // ── Footer summary row ──
  const footerRowNum = 6 + students.length;
  const footerRow = sheet.getRow(footerRowNum);
  footerRow.height = 24;

  let fc = 1;

  // TỔNG label
  const totalLabelCell = footerRow.getCell(fc);
  totalLabelCell.value = 'TỔNG';
  totalLabelCell.font = { bold: true, size: 10 };
  totalLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  totalLabelCell.fill = FOOTER_FILL;
  totalLabelCell.border = THIN_BORDER;
  fc++;

  // Student count
  const hvCountCell = footerRow.getCell(fc);
  hvCountCell.value = `${students.length} HV`;
  hvCountCell.font = { bold: true, size: 10, color: { argb: 'FF6B7280' } };
  hvCountCell.alignment = { horizontal: 'left', vertical: 'middle' };
  hvCountCell.fill = FOOTER_FILL;
  hvCountCell.border = THIN_BORDER;
  fc++;

  if (hasStudentCode) {
    const emptyCell = footerRow.getCell(fc);
    emptyCell.value = '';
    emptyCell.fill = FOOTER_FILL;
    emptyCell.border = THIN_BORDER;
    fc++;
  }

  // Per-date P/A counts
  for (let j = 0; j < sortedSchedules.length; j++) {
    const cell = footerRow.getCell(fc);
    cell.value = `${columnPresentCounts[j]}/${columnAbsentCounts[j]}`;
    cell.font = { bold: true, size: 9 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = FOOTER_FILL;
    cell.border = THIN_BORDER;
    fc++;
  }

  // Overall totals
  const overallPresentCell = footerRow.getCell(fc);
  overallPresentCell.value = overallPresent;
  overallPresentCell.font = { ...GREEN_FONT, size: 11 };
  overallPresentCell.alignment = { horizontal: 'center', vertical: 'middle' };
  overallPresentCell.fill = FOOTER_FILL;
  overallPresentCell.border = THIN_BORDER;
  fc++;

  const overallAbsentCell = footerRow.getCell(fc);
  overallAbsentCell.value = overallAbsent;
  overallAbsentCell.font = { ...RED_FONT, size: 11 };
  overallAbsentCell.alignment = { horizontal: 'center', vertical: 'middle' };
  overallAbsentCell.fill = FOOTER_FILL;
  overallAbsentCell.border = THIN_BORDER;

  // ── Legend row ──
  const legendRowNum = footerRowNum + 1;
  const legendRow = sheet.getRow(legendRowNum);
  sheet.mergeCells(legendRowNum, 1, legendRowNum, totalCols);
  const legendCell = legendRow.getCell(1);
  legendCell.value = '✓: Có mặt   ✗: Vắng   (trống): Chưa điểm danh';
  legendCell.font = { italic: true, size: 9, color: { argb: 'FF9CA3AF' } };
  legendCell.alignment = { horizontal: 'center' };

  // Write to buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/* ───────────────── Helpers ───────────────── */

function setHeaderCell(cell: ExcelJS.Cell, value: string) {
  cell.value = value;
  cell.font = { bold: true, size: 10, color: { argb: 'FF374151' } };
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  cell.fill = HEADER_FILL;
  cell.border = THIN_BORDER;
}

/** Convert 1-based column number to Excel letter (1→A, 27→AA) */
function colLetter(col: number): string {
  let letter = '';
  let n = col;
  while (n > 0) {
    n--;
    letter = String.fromCharCode(65 + (n % 26)) + letter;
    n = Math.floor(n / 26);
  }
  return letter;
}
