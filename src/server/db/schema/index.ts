import { account, session, verification } from "./db.schema.auth";
import { user } from "./db.schema.user";

export const schema = {
  user,
  account,
  session,
  verification,
};
