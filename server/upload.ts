import { protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import { createLabReport } from "./db";
import { nanoid } from "nanoid";

/**
 * tRPC procedure for uploading lab reports
 * Note: File upload should be handled by the frontend using S3 presigned URLs
 * This is a placeholder for the upload initiation
 */
export const uploadProcedure = protectedProcedure
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
      throw new Error(error instanceof Error ? error.message : "Upload failed");
    }
  });
