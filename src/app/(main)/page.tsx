import DashboardServer from '@/components/dashboard-server';

// Generate static page for better performance
export const revalidate = 30; // Revalidate every 30 seconds

export default function HomePage() {
  return <DashboardServer />;
} 