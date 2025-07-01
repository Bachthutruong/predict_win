
export default function MainPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is kept minimal to resolve a routing conflict.
  // The main layout logic is handled by the root layout.
  return <>{children}</>;
}
