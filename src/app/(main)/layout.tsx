
// This layout is no longer needed as the logic has been moved to the root layout.
// All pages under (main) will now be wrapped by the root layout's logic.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
