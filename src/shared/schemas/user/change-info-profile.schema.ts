import { z } from "zod";
import { usernameSchema } from "@/shared/schemas/user/username.schema";

export const ChangeInfoProfileSchema = z.object({
  username: usernameSchema,
  bio: z.string().max(300),
});

export type TypeChangeInfoProfileSchema = z.infer<
  typeof ChangeInfoProfileSchema
>;
