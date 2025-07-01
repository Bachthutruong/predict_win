
export default function DisabledPredictionsPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-destructive bg-destructive/10 text-destructive-foreground p-8 h-96">
        <h1 className="text-2xl font-bold">Page Temporarily Disabled</h1>
        <p className="text-center mt-2">This page is temporarily disabled to resolve a build conflict.</p>
        <p className="text-center mt-4 text-sm max-w-md">
            <strong>To fix this:</strong> Please rename the `src/app/(admin)` folder to `src/app/admin` (i.e., remove the parentheses). This will create the correct `/admin/*` routes and resolve the URL path collision.
        </p>
    </div>
  );
}
