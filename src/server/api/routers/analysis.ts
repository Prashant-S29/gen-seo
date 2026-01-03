import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { analysisSessions } from "~/server/db/schema/db.schema.analysis";
import { searchFormSchema } from "~/zodSchema/analysis";

export const analysisRouter = createTRPCRouter({
  // Create new analysis session
  create: protectedProcedure
    .input(searchFormSchema)
    .mutation(async ({ ctx, input }) => {
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

      return {
        sessionId: session[0]!.id,
        status: "pending",
      };
    }),

  // Get session by ID (for later use)
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
});
