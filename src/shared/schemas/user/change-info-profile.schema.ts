import { z } from "zod";
import { createUsernameSchema } from "@/shared/schemas/user/username.schema";

type ChangeInfoProfileValidationTranslator = (
  key: "usernameMin" | "usernamePattern" | "bioMax",
) => string;

const defaultMessages: Record<
  Parameters<ChangeInfoProfileValidationTranslator>[0],
  string
> = {
  usernameMin: "Username must be at least 5 characters long",
  usernamePattern:
    "Username can only contain Russian/English letters, digits, _ and -",
  bioMax: "Bio must be at most 300 characters long",
};

const defaultT: ChangeInfoProfileValidationTranslator = (key) =>
  defaultMessages[key];

export const createChangeInfoProfileSchema = (
  t: ChangeInfoProfileValidationTranslator = defaultT,
) =>
  z.object({
    username: createUsernameSchema(t),
    bio: z.string().max(300, { message: t("bioMax") }),
  });

export const ChangeInfoProfileSchema = createChangeInfoProfileSchema();

export type TypeChangeInfoProfileSchema = z.infer<
  ReturnType<typeof createChangeInfoProfileSchema>
>;
