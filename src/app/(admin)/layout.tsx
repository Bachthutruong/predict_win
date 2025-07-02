import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminStaffLayout from '@/components/admin-staff-layout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and admin role
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

  // Check if user is admin
  if (user.role !== 'admin') {
    redirect('/');
  }

  return <AdminStaffLayout>{children}</AdminStaffLayout>;
} 