
import { redirect } from 'next/navigation';

export default function DeprecatedDashboardPage() {
  // This route has been moved to the root page.
  redirect('/');
}
