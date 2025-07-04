import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/main-layout';

// This layout file has been disabled to resolve a persistent routing conflict
// between the (main) and (admin) route groups. The pages within this group
// will now correctly fall back to the root layout.
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will be handled by middleware, but adding as extra protection
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  if (!user.isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Email Verification Required</h1>
          <p className="text-muted-foreground">
            Please check your email and click the verification link to activate your account.
          </p>
        </div>
      </div>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}
