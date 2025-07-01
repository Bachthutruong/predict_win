import type { ReactNode } from 'react';

// This layout is a passthrough component to resolve a persistent routing conflict.
// By simply returning the children, we satisfy the Next.js compiler's need for a layout
// in this route group without creating a parallel route that conflicts with the `(admin)` group.
export default function MainRouteGroupPassthroughLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
