import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { analysisSessions } from "~/server/db/schema/db.schema.analysis";
import { searchFormSchema } from "~/zodSchema/analysis";
import { processAnalysisSession } from "~/server/services/session-orchestration";
import { and, eq } from "drizzle-orm";
import { prompts } from "~/server/db/schema/db.schema.prompts";

export const analysisRouter = createTRPCRouter({
  // Create new analysis session
  create: protectedProcedure
    .input(searchFormSchema)
    .mutation(async ({ ctx, input }) => {
      // Create session
      const session = await ctx.db
        .insert(analysisSessions)
        .values({
          userId: ctx.session.user.id,
          productName: input.productName,
          primaryBrand: input.primaryBrand,
          brands: [input.primaryBrand, ...input.competitors],
          category: input.category,
          status: "pending",
          totalPrompts: 5, // We'll generate 5 prompts for POC
        })
        .returning();

      const sessionId = session[0]!.id;

      // Start processing asynchronously (don't await)
      processAnalysisSession({
        sessionId,
        category: input.category,
        brands: [input.primaryBrand, ...input.competitors],
        productName: input.productName,
      }).catch((error) => {
        console.error(`Failed to process session ${sessionId}:`, error);
      });

      return {
        sessionId,
        status: "processing",
      };
    }),

  // Get session by ID
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.query.analysisSessions.findFirst({
        where: (sessions, { eq, and }) =>
          and(
            eq(sessions.id, input.sessionId),
            eq(sessions.userId, ctx.session.user.id),
          ),
      });

      if (!session) {
        throw new Error("Session not found");
      }

      return session;
    }),

  // Get complete analysis results
  getResults: protectedProcedure
    .input(z.object({ sessionId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      // Get session
      const session = await ctx.db.query.analysisSessions.findFirst({
        where: and(
          eq(analysisSessions.id, input.sessionId),
          eq(analysisSessions.userId, ctx.session.user.id),
        ),
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // Get all prompts with responses and mentions
      const promptsData = await ctx.db.query.prompts.findMany({
        where: eq(prompts.sessionId, input.sessionId),
        with: {
          responses: {
            with: {
              mentions: true,
            },
          },
        },
      });

      // Calculate metrics
      const totalPrompts = promptsData.length;
      const totalMentions = promptsData.reduce(
        (acc, prompt) =>
          acc +
          prompt.responses.reduce(
            (respAcc, resp) => respAcc + resp.mentions.length,
            0,
          ),
        0,
      );

      // Count prompts where primary brand was mentioned
      const primaryBrandMentions = promptsData.filter((prompt) =>
        prompt.responses.some((resp) =>
          resp.mentions.some(
            (mention) =>
              mention.brandName.toLowerCase() ===
              session.primaryBrand.toLowerCase(),
          ),
        ),
      ).length;

      // Calculate visibility score for primary brand
      const visibilityScore =
        totalPrompts > 0
          ? Math.round((primaryBrandMentions / totalPrompts) * 100)
          : 0;

      // Count mentions per brand
      const brandMentionCounts: Record<string, number> = {};
      session.brands.forEach((brand) => {
        brandMentionCounts[brand] = 0;
      });

      promptsData.forEach((prompt) => {
        prompt.responses?.forEach((resp) => {
          resp.mentions?.forEach((mention) => {
            brandMentionCounts[mention.brandName] =
              (brandMentionCounts[mention.brandName] ?? 0) + 1;
          });
        });
      });

      // Create leaderboard
      const leaderboard = Object.entries(brandMentionCounts)
        .map(([brand, count]) => ({
          brand,
          mentions: count,
          visibilityScore:
            totalPrompts > 0 ? Math.round((count / totalPrompts) * 100) : 0,
        }))
        .sort((a, b) => b.mentions - a.mentions);

      // Format prompts for display
      const promptsList = promptsData.map((prompt) => {
        const primaryBrandMentioned = prompt.responses.some((resp) =>
          resp.mentions.some(
            (mention) =>
              mention.brandName.toLowerCase() ===
              session.primaryBrand.toLowerCase(),
          ),
        );

        const competitorsMentioned = prompt.responses
          .flatMap((resp) => resp.mentions)
          .filter(
            (mention) =>
              mention.brandName.toLowerCase() !==
              session.primaryBrand.toLowerCase(),
          )
          .map((m) => m.brandName);

        return {
          id: prompt.id,
          text: prompt.promptText,
          type: prompt.promptType,
          primaryBrandMentioned,
          competitorsMentioned: [...new Set(competitorsMentioned)],
          responseCount: prompt.responses.length,
        };
      });

      return {
        session,
        metrics: {
          totalPrompts,
          totalMentions,
          visibilityScore,
          primaryBrandMentions,
        },
        leaderboard,
        prompts: promptsList,
      };
    }),
});
