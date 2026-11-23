import { AuthLayout } from '@/components/layouts/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export interface LoginPageProps {
  onLogin?: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <AuthLayout>
      <LoginForm onLogin={onLogin} />
    </AuthLayout>
  );
}

export default LoginPage;
