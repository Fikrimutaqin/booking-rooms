import * as React from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useAuth } from '@/hooks';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';
import type { LoginFormProps } from '@/types/auth';

/**
 * Name Function: LoginForm
 * Description: Login form component integrating react-hook-form + Zod validation, password visibility toggle, server error alerts, and login mutation execution.
 * Reason: Ensures accessible form controls (matching htmlFor labels and input ids), immediate validation feedback, and automated cookie-based session handling.
 **/
export function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const { login, loading, error } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  /**
   * Name Function: onSubmit
   * Description: Dispatches validated email and password credentials to the useAuth login routine.
   * Reason: Isolates asynchronous submission handling and prevents default form reloads via form.handleSubmit.
   **/
  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      onLogin?.();
    } catch {
      // Error message automatically caught and displayed via useAuth error state
    }
  };

  return (
    <Card className="mx-auto w-full max-w-sm border-border bg-card shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Shadcn UI Server Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="username"
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="none"
                      enterKeyHint="next"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        enterKeyHint="done"
                        disabled={loading}
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>

            {/* Footer note */}
            <div className="text-center text-sm text-muted-foreground pt-1">
              Don&apos;t have an account? Request to Admin
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
