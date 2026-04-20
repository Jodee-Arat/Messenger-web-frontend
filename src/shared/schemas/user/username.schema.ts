import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(5, { message: "Username must be at least 5 characters long" })
  .regex(/^[a-zA-Zа-яА-ЯёЁ0-9_]+(?:-[a-zA-Zа-яА-ЯёЁ0-9_]+)*$/, {
    message:
      "Username can only contain Russian/English letters, digits, _ and -",
  });
