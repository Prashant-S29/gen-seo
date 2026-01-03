import { account, session, verification } from "./db.schema.auth";
import { user } from "./db.schema.user";
import { analysisSessions } from "./db.schema.analysis";

export const schema = {
  user,
  account,
  session,
  verification,
  analysisSessions,
};
