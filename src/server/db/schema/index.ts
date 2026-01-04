import { account, session, verification } from "./db.schema.auth";
import { user } from "./db.schema.user";
import {
  analysisSessions,
  analysisSessionsRelations,
} from "./db.schema.analysis";
import {
  prompts,
  responses,
  promptsRelations,
  responsesRelations,
} from "./db.schema.prompts";
import {
  mentions,
  citations,
  mentionsRelations,
  citationsRelations,
} from "./db.schema.mentions";

export const schema = {
  user,
  account,
  session,
  verification,
  analysisSessions,
  prompts,
  responses,
  mentions,
  citations,
  analysisSessionsRelations,
  promptsRelations,
  responsesRelations,
  mentionsRelations,
  citationsRelations, // NEW
};
