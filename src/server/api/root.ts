import { helloRouter } from "~/server/api/routers/hello";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { analysisRouter } from "./routers/analysis";

export const appRouter = createTRPCRouter({
  hello: helloRouter,
  analysis: analysisRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
