import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  labReports,
  labValues,
  referenceRanges,
  medicalGlossary,
  notificationPreferences,
  notifications,
  type LabReport,
  type LabValue,
  type ReferenceRange,
  type MedicalGlossaryEntry,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== LAB REPORTS ====================

export async function createLabReport(userId: number, reportData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(labReports).values({
    userId,
    fileName: reportData.fileName,
    fileUrl: reportData.fileUrl,
    fileKey: reportData.fileKey,
    extractedText: reportData.extractedText,
    reportDate: reportData.reportDate,
    testingFacility: reportData.testingFacility,
    status: "pending",
  });

  return result;
}

export async function updateLabReportStatus(
  reportId: number,
  status: "pending" | "processing" | "completed" | "failed",
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(labReports)
    .set({
      status,
      errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(labReports.id, reportId));
}

export async function getLabReportById(reportId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(labReports)
    .where(eq(labReports.id, reportId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserLabReports(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(labReports)
    .where(eq(labReports.userId, userId))
    .orderBy(desc(labReports.createdAt));
}

// ==================== LAB VALUES ====================

export async function createLabValue(reportId: number, valueData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(labValues).values({
    reportId,
    testName: valueData.testName,
    testAbbreviation: valueData.testAbbreviation,
    value: valueData.value,
    unit: valueData.unit,
    referenceRangeLow: valueData.referenceRangeLow,
    referenceRangeHigh: valueData.referenceRangeHigh,
    status: valueData.status,
    severity: valueData.severity,
    interpretation: valueData.interpretation,
    recommendation: valueData.recommendation,
    color: valueData.color,
    emoji: valueData.emoji,
  });
}

export async function getReportLabValues(reportId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(labValues)
    .where(eq(labValues.reportId, reportId))
    .orderBy(desc(labValues.severity));
}

// ==================== REFERENCE RANGES ====================

export async function getReferenceRange(testAbbreviation: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(referenceRanges)
    .where(eq(referenceRanges.testAbbreviation, testAbbreviation.toUpperCase()))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getAllReferenceRanges() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(referenceRanges);
}

export async function createReferenceRange(rangeData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(referenceRanges).values(rangeData);
}

// ==================== MEDICAL GLOSSARY ====================

export async function getGlossaryTerm(term: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(medicalGlossary)
    .where(eq(medicalGlossary.term, term))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getGlossaryByAbbreviation(abbreviation: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(medicalGlossary)
    .where(eq(medicalGlossary.abbreviation, abbreviation.toUpperCase()))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function searchGlossary(searchTerm: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Simple search - can be enhanced with full-text search
  const lowerTerm = `%${searchTerm.toLowerCase()}%`;
  return db
    .select()
    .from(medicalGlossary)
    .where(
      eq(medicalGlossary.term, searchTerm)
    );
}

export async function createGlossaryEntry(entryData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(medicalGlossary).values(entryData);
}

// ==================== NOTIFICATIONS ====================

export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createOrUpdateNotificationPreferences(
  userId: number,
  preferences: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getNotificationPreferences(userId);

  if (existing) {
    return db
      .update(notificationPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId));
  } else {
    return db.insert(notificationPreferences).values({
      userId,
      ...preferences,
    });
  }
}

export async function createNotification(notificationData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(notifications).values(notificationData);
}

export async function getUserNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}
