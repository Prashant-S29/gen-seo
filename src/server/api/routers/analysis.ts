import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { analysisSessions } from "~/server/db/schema/db.schema.analysis";
import { prompts } from "~/server/db/schema/db.schema.prompts";
import { searchFormSchema } from "~/zodSchema/analysis";
import { processAnalysisSession } from "~/server/services/session-orchestration";
import { analyzeWebsiteForBusiness } from "~/server/services/website-analyzer";
import { eq, and, desc, count } from "drizzle-orm";

export const analysisRouter = createTRPCRouter({
  // Returns which features are available based on server env vars.
  // Public so the UI can gate crawling options without requiring auth.
  getCapabilities: publicProcedure.query(() => {
    const chatgptEnabled = !!(
      process.env.CHATGPT_EMAIL && process.env.CHATGPT_PASSWORD
    );
    const claudeCrawlEnabled = !!(
      process.env.CLAUDE_EMAIL && process.env.CLAUDE_PASSWORD
    );
    return {
      crawlingEnabled: chatgptEnabled || claudeCrawlEnabled,
      chatgptCrawlEnabled: chatgptEnabled,
      claudeCrawlEnabled: claudeCrawlEnabled,
    };
  }),

  // Create new analysis session
  create: protectedProcedure
    .input(searchFormSchema)
    .mutation(async ({ ctx, input }) => {
      // Calculate total prompts (prompts × providers)
      // const totalPrompts = input.promptCount * input.selectedProviders.length;

      // FIX
      // hardcoded to 5 * input.selectedProviders.length for now
      // (costs to much API quota)
      // totalPrompts = number of prompts (not prompt × providers).
      // processAPIMethod now updates completedPrompts once per prompt so the
      // progress bar shows 1/5, 2/5 … 5/5 in real time.
      const totalPrompts = 5;

      // Create session
      const session = await ctx.db
        .insert(analysisSessions)
        .values({
          userId: ctx.session.user.id,
          productName: input.productName,
          primaryBrand: input.primaryBrand,
          brands: [input.primaryBrand, ...input.competitors],
          category: input.category,
          selectedProviders: input.selectedProviders,
          // promptCount: input.promptCount,
          promptCount: 5,
          analysisMethod: input.analysisMethod ?? "api_only",
          status: "pending",
          totalPrompts: totalPrompts,
        })
        .returning();

      const sessionId = session[0]!.id;

      // Start processing asynchronously (don't await)
      processAnalysisSession({
        sessionId,
        category: input.category,
        brands: [input.primaryBrand, ...input.competitors],
        productName: input.productName,
        selectedProviders: input.selectedProviders,
        // promptCount: input.promptCount,
        promptCount: 5,
        analysisMethod: input.analysisMethod ?? "api_only",
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
    .input(z.object({ sessionId: z.string().uuid() }))
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
    .input(z.object({ sessionId: z.string().uuid() }))
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

      // Get all prompts with responses, mentions, and citations
      const promptsData = await ctx.db.query.prompts.findMany({
        where: eq(prompts.sessionId, input.sessionId),
        with: {
          responses: {
            with: {
              mentions: true,
              citations: true,
            },
          },
        },
      });

      // Calculate metrics
      const totalPrompts = promptsData.length;

      // Total mentions across all responses
      const totalMentions = promptsData.reduce(
        (acc, prompt) =>
          acc +
          prompt.responses.reduce(
            (respAcc, resp) => respAcc + resp.mentions.length,
            0,
          ),
        0,
      );

      // Total citations across all responses
      const totalCitations = promptsData.reduce(
        (acc, prompt) =>
          acc +
          prompt.responses.reduce(
            (respAcc, resp) => respAcc + resp.citations.length,
            0,
          ),
        0,
      );

      // Count prompts where primary brand was mentioned (across any provider)
      const primaryBrandMentions = promptsData.filter((prompt) =>
        prompt.responses.some((resp) =>
          resp.mentions.some(
            (mention) =>
              mention.brandName.toLowerCase() ===
              session.primaryBrand.toLowerCase(),
          ),
        ),
      ).length;

      // Count how many times primary brand was cited
      const primaryBrandCitations = promptsData.reduce(
        (acc, prompt) =>
          acc +
          prompt.responses.reduce((respAcc, resp) => {
            const cited = resp.mentions.some(
              (mention) =>
                mention.brandName.toLowerCase() ===
                  session.primaryBrand.toLowerCase() && mention.isCited,
            );
            return respAcc + (cited ? 1 : 0);
          }, 0),
        0,
      );

      // Calculate visibility score for primary brand
      const visibilityScore =
        totalPrompts > 0
          ? Math.round((primaryBrandMentions / totalPrompts) * 100)
          : 0;

      // Calculate citation rate for primary brand
      const citationRate =
        primaryBrandMentions > 0
          ? Math.round((primaryBrandCitations / primaryBrandMentions) * 100)
          : 0;

      // Count mentions per brand across all providers
      const brandMentionCounts: Record<string, number> = {};
      const brandCitationCounts: Record<string, number> = {};

      session.brands.forEach((brand) => {
        brandMentionCounts[brand] = 0;
        brandCitationCounts[brand] = 0;
      });

      promptsData.forEach((prompt) => {
        prompt.responses.forEach((resp) => {
          resp.mentions.forEach((mention) => {
            if (brandMentionCounts[mention.brandName] !== undefined) {
              brandMentionCounts[mention.brandName] =
                (brandMentionCounts[mention.brandName] ?? 0) + 1;
              if (mention.isCited) {
                brandCitationCounts[mention.brandName] =
                  (brandCitationCounts[mention.brandName] ?? 0) + 1;
              }
            }
          });
        });
      });

      // Create leaderboard
      const leaderboard = Object.entries(brandMentionCounts)
        .map(([brand, count]) => ({
          brand,
          mentions: count,
          citations: brandCitationCounts[brand] || 0,
          visibilityScore:
            totalPrompts > 0 ? Math.round((count / totalPrompts) * 100) : 0,
          citationRate:
            count > 0
              ? Math.round(((brandCitationCounts[brand] || 0) / count) * 100)
              : 0,
        }))
        .sort((a, b) => b.mentions - a.mentions);

      // Group responses by platform for display
      const responsesByPlatform: Record<string, number> = {};
      promptsData.forEach((prompt) => {
        prompt.responses.forEach((resp) => {
          responsesByPlatform[resp.platform] =
            (responsesByPlatform[resp.platform] || 0) + 1;
        });
      });

      // Get top cited domains
      const domainCounts: Record<string, number> = {};
      promptsData.forEach((prompt) => {
        prompt.responses.forEach((resp) => {
          resp.citations.forEach((citation) => {
            domainCounts[citation.domain] =
              (domainCounts[citation.domain] || 0) + 1;
          });
        });
      });

      const topCitedDomains = Object.entries(domainCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([domain, count]) => ({ domain, count }));

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

        const citationCount = prompt.responses.reduce(
          (acc, resp) => acc + resp.citations.length,
          0,
        );

        return {
          id: prompt.id,
          text: prompt.promptText,
          type: prompt.promptType,
          primaryBrandMentioned,
          competitorsMentioned: [...new Set(competitorsMentioned)],
          responseCount: prompt.responses.length,
          citationCount,
        };
      });

      return {
        session,
        metrics: {
          totalPrompts,
          totalMentions,
          totalCitations,
          visibilityScore,
          primaryBrandMentions,
          primaryBrandCitations,
          citationRate,
          responsesByPlatform,
        },
        leaderboard,
        topCitedDomains,
        prompts: promptsList,
      };
    }),

  // list sessions with pagination
  listSessions: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      // Get total count
      const totalCount = await ctx.db
        .select({ count: count() })
        .from(analysisSessions)
        .where(eq(analysisSessions.userId, ctx.session.user.id));

      const total = totalCount[0]?.count ?? 0;
      const totalPages = Math.ceil(total / input.limit);

      // Get sessions for current page
      const sessions = await ctx.db.query.analysisSessions.findMany({
        where: eq(analysisSessions.userId, ctx.session.user.id),
        orderBy: [desc(analysisSessions.createdAt)],
        limit: input.limit,
        offset: offset,
      });

      return {
        sessions,
        totalPages,
        currentPage: input.page,
        totalCount: total,
      };
    }),

  // delete a session
  deleteSession: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const session = await ctx.db.query.analysisSessions.findFirst({
        where: and(
          eq(analysisSessions.id, input.sessionId),
          eq(analysisSessions.userId, ctx.session.user.id),
        ),
      });

      if (!session) {
        throw new Error("Session not found or unauthorized");
      }

      // Delete session (cascades to prompts, responses, mentions, citations)
      await ctx.db
        .delete(analysisSessions)
        .where(eq(analysisSessions.id, input.sessionId));

      return { success: true };
    }),

  // Analyze website to extract business info for pre-filling the form
  analyzeWebsite: protectedProcedure
    .input(z.object({ url: z.string().min(3) }))
    .mutation(async ({ input }) => {
      return await analyzeWebsiteForBusiness(input.url);
    }),
});
