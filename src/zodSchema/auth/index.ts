import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginFormSchemaType = z.infer<typeof LoginFormSchema>;

export const SignupFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export type SignupFormSchemaType = z.infer<typeof SignupFormSchema>;

export const ResetPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export type ResetPasswordSchemaType = z.infer<typeof ResetPasswordSchema>;

export const NewPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type NewPasswordFormSchemaType = z.infer<typeof NewPasswordFormSchema>;
