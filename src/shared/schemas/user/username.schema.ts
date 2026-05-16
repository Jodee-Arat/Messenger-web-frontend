import { z } from "zod";

type UsernameValidationTranslator = (
  key: "usernameMin" | "usernamePattern",
) => string;

const defaultMessages: Record<
  Parameters<UsernameValidationTranslator>[0],
  string
> = {
  usernameMin: "Username must be at least 5 characters long",
  usernamePattern:
    "Username can only contain Russian/English letters, digits, _ and -",
};

const defaultT: UsernameValidationTranslator = (key) => defaultMessages[key];

export const createUsernameSchema = (
  t: UsernameValidationTranslator = defaultT,
) =>
  z
    .string()
    .min(5, { message: t("usernameMin") })
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9_]+(?:-[a-zA-Zа-яА-ЯёЁ0-9_]+)*$/, {
      message: t("usernamePattern"),
    });

export const usernameSchema = createUsernameSchema();
