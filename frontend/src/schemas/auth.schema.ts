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
