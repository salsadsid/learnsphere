import { randomUUID } from "crypto";
import mongoose, { Schema } from "mongoose";
import type { AuditLogEntry, UserRole } from "../domain/types";

type AuditLogInput = {
  actorId: AuditLogEntry["actorId"];
  actorRole?: UserRole;
  action: string;
  subject: string;
};

const AuditLogSchema = new Schema<AuditLogEntry>(
  {
    id: { type: String, required: true, unique: true, index: true },
    actorId: { type: String, required: true, index: true },
    actorRole: { type: String, enum: ["student", "instructor", "admin"] },
    action: { type: String, required: true },
    subject: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { versionKey: false }
);

const AuditLogModel =
  (mongoose.models.AuditLogEntry as mongoose.Model<AuditLogEntry> | undefined) ??
  mongoose.model<AuditLogEntry>("AuditLogEntry", AuditLogSchema);

export const addAuditLogEntry = async (input: AuditLogInput): Promise<AuditLogEntry> => {
  const entry: AuditLogEntry = {
    id: randomUUID(),
    actorId: input.actorId,
    action: input.action,
    subject: input.subject,
    createdAt: new Date(),
    ...(input.actorRole !== undefined ? { actorRole: input.actorRole } : {}),
  };

  await AuditLogModel.create(entry);
  return entry;
};

export const listAuditLogEntries = async (): Promise<AuditLogEntry[]> =>
  AuditLogModel.find()
    .sort({ createdAt: -1 })
    .select("-__v -_id")
    .lean<AuditLogEntry[]>()
    .exec();
