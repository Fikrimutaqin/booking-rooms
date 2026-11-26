import { AuthLayout } from '@/components/layouts/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import type { LoginPageProps } from '@/types/auth';

export type { LoginPageProps };

/**
 * Name Function: LoginPage
 * Description: Login authentication page rendering the centered AuthLayout and the credential input LoginForm.
 * Reason: Separates the layout wrapper from the form component so LoginForm can be reused independently across different views or modals.
 **/
export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <AuthLayout>
      <LoginForm onLogin={onLogin} />
    </AuthLayout>
  );
}

export default LoginPage;
