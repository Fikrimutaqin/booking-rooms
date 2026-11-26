import { AuthLayout } from '@/components/layouts/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';
import type { RegisterPageProps } from '@/types/auth';

export type { RegisterPageProps };

/**
 * Name Function: RegisterPage
 * Description: Registration authentication page rendering the centered AuthLayout and the credential input RegisterForm.
 * Reason: Separates the layout wrapper from the form component so RegisterForm can be reused independently across views or modal overlays.
 **/
export function RegisterPage({ onRegister }: RegisterPageProps) {
  return (
    <AuthLayout>
      <RegisterForm onRegister={onRegister} />
    </AuthLayout>
  );
}

export default RegisterPage;
