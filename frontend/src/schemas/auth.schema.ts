import { z } from 'zod';

/**
 * Name Schema: loginSchema
 * Description: Zod validation schema for the login form values ensuring valid email formatting and minimum password length.
 * Reason: Prevents invalid payload dispatches to authentication endpoints and provides immediate inline form validation feedback.
 **/
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address format' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Name Schema: registerSchema
 * Description: Zod validation schema for the registration form values ensuring valid name, email formatting, and 8-16 character password matching backend RegisterDto.
 * Reason: Prevents invalid payload dispatches to /auth/register and verifies password confirmation match on the client.
 **/
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Full name is required' })
      .max(100, { message: 'Name cannot exceed 100 characters' }),
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email address format' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .max(16, { message: 'Password cannot exceed 16 characters' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
