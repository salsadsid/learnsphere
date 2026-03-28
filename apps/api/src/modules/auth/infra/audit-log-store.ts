import { randomUUID } from "crypto";
import type { AuditLogEntry, UserRole } from "../domain/types";

type AuditLogInput = {
  actorId: AuditLogEntry["actorId"];
  actorRole?: UserRole;
  action: string;
  subject: string;
};

const entries: AuditLogEntry[] = [];

export const addAuditLogEntry = (input: AuditLogInput): AuditLogEntry => {
  const entry: AuditLogEntry = {
    id: randomUUID(),
    actorId: input.actorId,
    action: input.action,
    subject: input.subject,
    createdAt: new Date(),
    ...(input.actorRole !== undefined ? { actorRole: input.actorRole } : {}),
  };

  entries.push(entry);
  return entry;
};

export const listAuditLogEntries = (): AuditLogEntry[] => [...entries];
