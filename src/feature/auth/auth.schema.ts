import z from "zod";

export const SignupSchema = z.object({
  name: z
    .string({
      error: "Name is required",
    })
    .trim()
    .min(3, {
      message: "Name must be at least 3 characters long",
    })
    .max(50, {
      message: "Name must be under 50 characters",
    }),
  email: z
    .string({
      error: "Email is required",
    })
    .email({
      message: "Please enter a valid email address",
    }),
  password: z
    .string({
      error: "Password is required",
    })
    .min(8, {
      error: "Password must be at least 8 characters long",
    })
    .max(100, {
      error: "Password must be under 100 characters",
    }),
});
export const LoginSchema = z.object({
  email: z
    .string({
      error: "Email is required",
    })
    .email({
      message: "Please enter a valid email address",
    }),
  password: z
    .string({
      error: "Password is required",
    })
    .min(8, {
      error: "Password must be at least 8 characters long",
    })
    .max(100, {
      error: "Password must be under 100 characters",
    }),
});
