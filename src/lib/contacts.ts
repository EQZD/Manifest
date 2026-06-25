import * as XLSX from "xlsx";
import type { ContactsParseResult, ParsedContact } from "../types/campaign";

const REQUIRED_FIELDS = ["email", "name", "company"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

export async function parseContactsFile(file: File): Promise<ContactsParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return {
      contacts: [],
      missingFields: REQUIRED_FIELDS,
      rowErrors: [],
      totalRows: 0,
    };
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  if (rows.length === 0) {
    return {
      contacts: [],
      missingFields: REQUIRED_FIELDS,
      rowErrors: [],
      totalRows: 0,
    };
  }

  const originalHeaders = Object.keys(rows[0]);
  const headerMap = new Map<string, string>();
  originalHeaders.forEach((header) => {
    headerMap.set(normalizeHeader(header), header);
  });

  const missingFields = REQUIRED_FIELDS.filter((field) => !headerMap.has(field));

  const contacts: ParsedContact[] = [];
  const rowErrors: { row: number; reason: string }[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // account for header row, 1-indexed
    const emailKey = headerMap.get("email");
    const rawEmail = emailKey ? String(row[emailKey] ?? "").trim() : "";

    if (!rawEmail) {
      rowErrors.push({ row: rowNumber, reason: "пустой email" });
      return;
    }

    if (!EMAIL_PATTERN.test(rawEmail)) {
      rowErrors.push({ row: rowNumber, reason: `некорректный email: ${rawEmail}` });
      return;
    }

    const contact: ParsedContact = { email: rawEmail };
    originalHeaders.forEach((header) => {
      const normalized = normalizeHeader(header);
      const value = String(row[header] ?? "").trim();
      contact[normalized] = value;
    });

    contacts.push(contact);
  });

  return {
    contacts,
    missingFields,
    rowErrors,
    totalRows: rows.length,
  };
}

export function extractTemplateVariables(html: string): string[] {
  const matches = html.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  const found = new Set<string>();
  for (const match of matches) {
    found.add(match[1]);
  }
  return Array.from(found);
}
