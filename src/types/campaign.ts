export type DispatchStatus = "idle" | "validating" | "sending" | "success" | "error";

export interface CampaignFormValues {
  campaignName: string;
  subject: string;
  htmlTemplate: string;
  scheduledDate: string;
  scheduledTime: string;
  excelFile: FileList | null;
}

export interface ParsedContact {
  email: string;
  name?: string;
  company?: string;
  [key: string]: string | undefined;
}

export interface ContactsParseResult {
  contacts: ParsedContact[];
  missingFields: string[];
  rowErrors: { row: number; reason: string }[];
  totalRows: number;
}

export interface TemplateVariable {
  key: string;
  resolvable: boolean;
}
