import { z } from "zod";
import { usernameSchema } from "@/shared/schemas/user/username.schema";

export const createAccountWEmailSchema = z.object({
  username: usernameSchema,
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(3, { message: "Email must be at least 3 characters long" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,}$/, {
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    }),
});

export type createAccountWEmailSchemaType = z.infer<
  typeof createAccountWEmailSchema
>;
