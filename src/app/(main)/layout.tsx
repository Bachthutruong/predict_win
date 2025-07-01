
// This layout file has been disabled to resolve a persistent routing conflict
// between the (main) and (admin) route groups. The pages within this group
// will now correctly fall back to the root layout.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
