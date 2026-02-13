import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Lab reports uploaded by users
 */
export const labReports = mysqlTable("lab_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(), // S3 URL
  fileKey: varchar("file_key", { length: 255 }).notNull(), // S3 key for reference
  extractedText: text("extracted_text"), // Raw OCR/PDF text
  reportDate: timestamp("report_date"), // Date of the lab report
  testingFacility: varchar("testing_facility", { length: 255 }), // Lab name if detected
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending"),
  errorMessage: text("error_message"), // If processing failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type LabReport = typeof labReports.$inferSelect;
export type InsertLabReport = typeof labReports.$inferInsert;

/**
 * Individual lab values extracted from reports
 */
export const labValues = mysqlTable("lab_values", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("report_id").notNull(),
  testName: varchar("test_name", { length: 255 }).notNull(), // e.g., "Hemoglobin"
  testAbbreviation: varchar("test_abbreviation", { length: 50 }), // e.g., "HGB"
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 50 }), // e.g., "g/dL"
  referenceRangeLow: decimal("reference_range_low", { precision: 10, scale: 4 }),
  referenceRangeHigh: decimal("reference_range_high", { precision: 10, scale: 4 }),
  status: mysqlEnum("status", ["normal", "borderline_low", "borderline_high", "low", "high", "very_low", "very_high"]).notNull(),
  severity: mysqlEnum("severity", ["none", "low", "medium", "high"]).notNull(),
  interpretation: text("interpretation"), // Plain English explanation from AI
  recommendation: text("recommendation"), // What to do about this result
  color: varchar("color", { length: 7 }), // Hex color code (#A8E6A0, #FFD966, #FFAAA5)
  emoji: varchar("emoji", { length: 10 }), // Visual indicator (✅, ⚠️, 🔴)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LabValue = typeof labValues.$inferSelect;
export type InsertLabValue = typeof labValues.$inferInsert;

/**
 * Medical reference ranges for different demographics
 */
export const referenceRanges = mysqlTable("reference_ranges", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("test_name", { length: 255 }).notNull(),
  testAbbreviation: varchar("test_abbreviation", { length: 50 }).notNull().unique(),
  category: varchar("category", { length: 100 }), // e.g., "Hematology", "Chemistry"
  unit: varchar("unit", { length: 50 }),
  rangeLowMale: decimal("range_low_male", { precision: 10, scale: 4 }),
  rangeHighMale: decimal("range_high_male", { precision: 10, scale: 4 }),
  rangeLowFemale: decimal("range_low_female", { precision: 10, scale: 4 }),
  rangeHighFemale: decimal("range_high_female", { precision: 10, scale: 4 }),
  rangeLowChild: decimal("range_low_child", { precision: 10, scale: 4 }),
  rangeHighChild: decimal("range_high_child", { precision: 10, scale: 4 }),
  description: text("description"), // Clinical significance
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ReferenceRange = typeof referenceRanges.$inferSelect;
export type InsertReferenceRange = typeof referenceRanges.$inferInsert;

/**
 * Medical glossary for term definitions
 */
export const medicalGlossary = mysqlTable("medical_glossary", {
  id: int("id").autoincrement().primaryKey(),
  term: varchar("term", { length: 255 }).notNull().unique(),
  abbreviation: varchar("abbreviation", { length: 50 }),
  definition: text("definition").notNull(),
  plainEnglish: text("plain_english"), // Simplified explanation
  category: varchar("category", { length: 100 }), // e.g., "Blood Test", "Kidney Function"
  relatedTerms: json("related_terms"), // Array of related term IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MedicalGlossaryEntry = typeof medicalGlossary.$inferSelect;
export type InsertMedicalGlossaryEntry = typeof medicalGlossary.$inferInsert;

/**
 * Notification preferences and history
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  emailOnCriticalValues: boolean("email_on_critical_values").default(true),
  emailOnAnalysisComplete: boolean("email_on_analysis_complete").default(true),
  emailOnAbnormalResults: boolean("email_on_abnormal_results").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Notification history
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  reportId: int("report_id"),
  type: mysqlEnum("type", ["critical_value", "analysis_complete", "abnormal_result"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  emailSent: boolean("email_sent").default(false),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
