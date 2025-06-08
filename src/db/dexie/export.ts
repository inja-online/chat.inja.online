import { db } from "./schema";

export interface ExportData {
  version: string;
  exportedAt: string;
  projects: any[];
  threads: any[];
  messages: any[];
  searchTokens: any[];
}

export async function exportAllData(): Promise<ExportData> {
  const [projects, threads, messages, searchTokens] = await Promise.all([
    db.projects.toArray(),
    db.threads.toArray(),
    db.messages.toArray(),
    db.searchTokens.toArray(),
  ]);

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    projects: projects.map(sanitizeForExport),
    threads: threads.map(sanitizeForExport),
    messages: messages.map(sanitizeForExport),
    searchTokens: searchTokens.map(sanitizeForExport),
  };
}

export async function exportProject(projectId: number): Promise<ExportData> {
  const [project, threads, messages] = await Promise.all([
    db.projects.get(projectId),
    db.threads.where("projectId").equals(projectId).toArray(),
    db.messages.where("projectId").equals(projectId).toArray(),
  ]);

  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  const threadIds = threads.map((t) => t.id).filter(Boolean) as number[];
  const messageIds = messages.map((m) => m.id).filter(Boolean) as number[];

  const searchTokens = await db.searchTokens
    .where("referenceId")
    .anyOf([projectId, ...threadIds, ...messageIds])
    .toArray();

  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    projects: [project].map(sanitizeForExport),
    threads: threads.map(sanitizeForExport),
    messages: messages.map(sanitizeForExport),
    searchTokens: searchTokens.map(sanitizeForExport),
  };
}

export async function exportProjectsAsJSON(projectIds?: number[]): Promise<string> {
  let data: ExportData;

  if (!projectIds || projectIds.length === 0) {
    data = await exportAllData();
  } else if (projectIds.length === 1) {
    data = await exportProject(projectIds[0]);
  } else {
    const exportPromises = projectIds.map((id) => exportProject(id));
    const exports = await Promise.all(exportPromises);

    data = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      projects: exports.flatMap((exp) => exp.projects),
      threads: exports.flatMap((exp) => exp.threads),
      messages: exports.flatMap((exp) => exp.messages),
      searchTokens: exports.flatMap((exp) => exp.searchTokens),
    };
  }

  return JSON.stringify(data, null, 2);
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportAndDownload(projectIds?: number[], filename?: string): Promise<void> {
  const jsonData = await exportProjectsAsJSON(projectIds);
  const defaultFilename =
    projectIds?.length === 1
      ? `project-${projectIds[0]}-export-${Date.now()}.json`
      : `chat-export-${Date.now()}.json`;

  downloadJSON(jsonData, filename || defaultFilename);
}

function sanitizeForExport(obj: any): any {
  const sanitized = { ...obj };

  if (sanitized.attachments) {
    sanitized.attachments = sanitized.attachments.map((attachment: any) => ({
      ...attachment,
      data: "[Binary data removed for export]",
    }));
  }

  return sanitized;
}

export async function getExportStats(): Promise<{
  totalProjects: number;
  totalThreads: number;
  totalMessages: number;
  totalSearchTokens: number;
  databaseSize: string;
}> {
  const [projects, threads, messages, searchTokens] = await Promise.all([
    db.projects.count(),
    db.threads.count(),
    db.messages.count(),
    db.searchTokens.count(),
  ]);

  const estimatedSize = projects * 500 + threads * 300 + messages * 1000 + searchTokens * 100;

  return {
    totalProjects: projects,
    totalThreads: threads,
    totalMessages: messages,
    totalSearchTokens: searchTokens,
    databaseSize: formatBytes(estimatedSize),
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
