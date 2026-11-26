import { cn } from '@/lib/utils';
import type { AuthLayoutProps } from '@/types/layout';

export type { AuthLayoutProps };

/**
 * Name Function: AuthLayout
 * Description: Authentication page layout component providing a vertically and horizontally centered container with accessibility skip links.
 * Reason: Ensures the login card is rendered proportionally across mobile, tablet, and desktop screens.
 **/
export function AuthLayout({
  children,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen w-full flex flex-col justify-between bg-background text-foreground selection:bg-primary selection:text-primary-foreground antialiased',
        className
      )}
    >
      {/* Skip Link for Accessibility */}
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md"
      >
        Skip to login form
      </a>

      {/* Main Centered Auth Section */}
      <main
        id="auth-content"
        className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8"
      >
        <div className="w-full max-w-sm space-y-6">
          {/* Form Content */}
          <section aria-label="Sign in container">
            {children}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        &copy; {new Date().getFullYear()} Booking Rooms. All rights reserved.
      </footer>
    </div>
  );
}

export default AuthLayout;
