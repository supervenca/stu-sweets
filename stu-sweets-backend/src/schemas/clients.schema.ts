import { z } from "zod";

export const toggleBlacklistSchema = z.object({
  blacklist: z.boolean(),
}).strict();
