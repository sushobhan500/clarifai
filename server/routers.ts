import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createLabReport,
  updateLabReportStatus,
  getLabReportById,
  getUserLabReports,
  createLabValue,
  getReportLabValues,
  getReferenceRange,
  getAllReferenceRanges,
  getGlossaryTerm,
  getGlossaryByAbbreviation,
  searchGlossary,
  getNotificationPreferences,
  getUserNotifications,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== REPORT MANAGEMENT ====================
  reports: router({
    /**
     * Get all reports for the current user
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        const reports = await getUserLabReports(ctx.user.id);
        return reports;
      } catch (error) {
        console.error("Error fetching reports:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch reports",
        });
      }
    }),

    /**
     * Get a specific report with all its lab values
     */
    getById: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const report = await getLabReportById(input.reportId);

          if (!report) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Report not found",
            });
          }

          // Verify ownership
          if (report.userId !== ctx.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have access to this report",
            });
          }

          const labValues = await getReportLabValues(input.reportId);

          return {
            ...report,
            labValues,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch report",
          });
        }
      }),

    /**
     * Upload and analyze a lab report
     * This is a placeholder - actual file upload will be handled by separate endpoint
     */
    analyze: protectedProcedure
      .input(
        z.object({
          reportId: z.number(),
          extractedText: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const report = await getLabReportById(input.reportId);

          if (!report) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Report not found",
            });
          }

          if (report.userId !== ctx.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You do not have access to this report",
            });
          }

          // Update status to processing
          await updateLabReportStatus(input.reportId, "processing");

          // Parse lab values from extracted text
          const parsedValues = await parseLabValuesWithAI(input.extractedText);

          // Create lab value records with AI interpretation
          for (const value of parsedValues) {
            const referenceRange = await getReferenceRange(
              value.testAbbreviation || value.testName
            );

            const interpretation = await generateInterpretation(
              value.testName,
              value.value,
              referenceRange,
              value.unit
            );

            await createLabValue(input.reportId, {
              ...value,
              ...interpretation,
            });
          }

          // Update status to completed
          await updateLabReportStatus(input.reportId, "completed");

          const labValues = await getReportLabValues(input.reportId);
          return {
            success: true,
            labValues,
          };
        } catch (error) {
          console.error("Error analyzing report:", error);
          await updateLabReportStatus(
            input.reportId,
            "failed",
            error instanceof Error ? error.message : "Unknown error"
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to analyze report",
          });
        }
      }),

    /**
     * Compare multiple reports to show trends
     */
    compareTrends: protectedProcedure
      .input(z.object({ reportIds: z.array(z.number()) }))
      .query(async ({ ctx, input }) => {
        try {
          const reports = [];

          for (const reportId of input.reportIds) {
            const report = await getLabReportById(reportId);

            if (!report || report.userId !== ctx.user.id) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "Access denied to one or more reports",
              });
            }

            const labValues = await getReportLabValues(reportId);
            reports.push({ ...report, labValues });
          }

          // Group by test name and show trends
          const trends: Record<string, any[]> = {};

          for (const report of reports) {
            for (const value of report.labValues) {
              if (!trends[value.testName]) {
                trends[value.testName] = [];
              }
              trends[value.testName].push({
                date: report.createdAt,
                value: value.value,
                status: value.status,
                unit: value.unit,
              });
            }
          }

          return trends;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error comparing trends:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to compare reports",
          });
        }
      }),
  }),

  // ==================== MEDICAL GLOSSARY ====================
  glossary: router({
    /**
     * Get definition for a medical term
     */
    getTerm: publicProcedure
      .input(z.object({ term: z.string() }))
      .query(async ({ input }) => {
        try {
          let glossaryEntry = await getGlossaryTerm(input.term);

          if (!glossaryEntry) {
            glossaryEntry = await getGlossaryByAbbreviation(input.term);
          }

          if (!glossaryEntry) {
            // Try to get AI-generated definition
            const aiDefinition = await generateGlossaryDefinition(input.term);
            return {
              term: input.term,
              definition: aiDefinition,
              source: "ai",
            };
          }

          return glossaryEntry;
        } catch (error) {
          console.error("Error fetching glossary term:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch glossary term",
          });
        }
      }),

    /**
     * Search glossary entries
     */
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        try {
          const results = await searchGlossary(input.query);
          return results;
        } catch (error) {
          console.error("Error searching glossary:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to search glossary",
          });
        }
      }),
  }),

  // ==================== NOTIFICATIONS ====================
  notifications: router({
    /**
     * Get user's notification preferences
     */
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      try {
        const preferences = await getNotificationPreferences(ctx.user.id);
        return (
          preferences || {
            emailOnCriticalValues: true,
            emailOnAnalysisComplete: true,
            emailOnAbnormalResults: true,
          }
        );
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch preferences",
        });
      }
    }),

    /**
     * Get user's notifications
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        const notifications = await getUserNotifications(ctx.user.id);
        return notifications;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notifications",
        });
      }
    }),
  }),

  // ==================== HEALTH CHECK ====================
  health: router({
    check: publicProcedure.query(() => {
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
    }),
  }),

  // ==================== FILE UPLOAD ====================
  upload: router({
    initiateUpload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileSize: z.number(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Return presigned URL for direct S3 upload
        // Frontend will upload directly to S3 using this URL
        const fileKey = `lab-reports/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        return {
          success: true,
          fileKey,
          message: "Upload initiated. Use presigned URL to upload file.",
        };
      }),

    completeUpload: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileUrl: z.string(),
          fileKey: z.string(),
          extractedText: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const result = await createLabReport(ctx.user.id, {
            fileName: input.fileName,
            fileUrl: input.fileUrl,
            fileKey: input.fileKey,
            extractedText: input.extractedText || null,
            reportDate: new Date(),
            testingFacility: null,
          });

          return {
            success: true,
            reportId: (result as any).insertId,
            message: "Report uploaded successfully",
          };
        } catch (error) {
          console.error("Upload error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Upload failed",
          });
        }
      }),
  }),
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse lab values from extracted text using AI
 */
async function parseLabValuesWithAI(text: string) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a medical lab report parser. Extract all lab test values from the provided text.
Return a JSON array with objects containing: testName, testAbbreviation, value, unit, referenceRangeLow, referenceRangeHigh.
Be strict about extracting only actual lab values with numeric results.` as string,
        },
        {
          role: "user",
          content: text as string,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "lab_values",
          strict: true,
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                testName: { type: "string" },
                testAbbreviation: { type: "string" },
                value: { type: "number" },
                unit: { type: "string" },
                referenceRangeLow: { type: "number" },
                referenceRangeHigh: { type: "number" },
              },
              required: ["testName", "value"],
            },
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (!content) return [];

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    return JSON.parse(contentStr);
  } catch (error) {
    console.error("Error parsing lab values with AI:", error);
    return [];
  }
}

/**
 * Generate patient-friendly interpretation for a lab value
 */
async function generateInterpretation(
  testName: string,
  value: number,
  referenceRange: any,
  unit: string
) {
  try {
    const refLow = referenceRange?.rangeLowMale || 0;
    const refHigh = referenceRange?.rangeHighMale || 100;

    // Determine status
    let status = "normal";
    let severity = "none";

    if (value < refLow) {
      const deviation = ((refLow - value) / refLow) * 100;
      if (deviation < 5) {
        status = "borderline_low";
        severity = "low";
      } else if (deviation < 20) {
        status = "low";
        severity = "medium";
      } else {
        status = "very_low";
        severity = "high";
      }
    } else if (value > refHigh) {
      const deviation = ((value - refHigh) / refHigh) * 100;
      if (deviation < 5) {
        status = "borderline_high";
        severity = "low";
      } else if (deviation < 20) {
        status = "high";
        severity = "medium";
      } else {
        status = "very_high";
        severity = "high";
      }
    }

    // Generate AI interpretation
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a medical expert who explains lab results to patients in plain English without jargon.
Generate a brief, reassuring explanation of what this lab value means.
Status: ${status}
Keep it under 2 sentences and avoid medical jargon.` as string,
        },
        {
          role: "user",
          content: `Test: ${testName}, Value: ${value} ${unit}, Reference Range: ${refLow}-${refHigh}` as string,
        },
      ],
    });

    const interpretation =
      response.choices[0]?.message.content || "Your result is being reviewed.";

    // Color coding
    let color = "#A8E6A0"; // Green
    let emoji = "✅";

    if (status === "normal") {
      color = "#A8E6A0";
      emoji = "✅";
    } else if (status.includes("borderline")) {
      color = "#FFD966";
      emoji = "⚠️";
    } else if (severity === "high") {
      color = "#FFAAA5";
      emoji = "🔴";
    } else {
      color = "#FFD966";
      emoji = "⚠️";
    }

    return {
      status,
      severity,
      interpretation,
      recommendation: `Please discuss this result with your healthcare provider.`,
      color,
      emoji,
    };
  } catch (error) {
    console.error("Error generating interpretation:", error);
    return {
      status: "normal",
      severity: "none",
      interpretation: "Your result is within expected range.",
      recommendation: "No action needed at this time.",
      color: "#A8E6A0",
      emoji: "✅",
    };
  }
}

/**
 * Generate glossary definition using AI
 */
async function generateGlossaryDefinition(term: string) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a medical expert. Provide a clear, patient-friendly definition of the medical term.
Keep it under 100 words and avoid complex medical jargon.` as string,
        },
        {
          role: "user",
          content: `Define: ${term}` as string,
        },
      ],
    });

    return response.choices[0]?.message.content || `${term} is a medical term.`;
  } catch (error) {
    console.error("Error generating glossary definition:", error);
    return `${term} is a medical term. Please consult with a healthcare provider for more information.`;
  }
}

export type AppRouter = typeof appRouter;
