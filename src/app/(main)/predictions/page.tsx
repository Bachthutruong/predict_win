// This page is disabled to resolve a build conflict.
//
// The root cause is a folder structure issue: `src/app/(admin)` is a
// "route group", which means `src/app/(admin)/predictions/page.tsx` and
// `src/app/(main)/predictions/page.tsx` both try to create a page at the URL "/predictions".
//
// The correct fix is to rename the `src/app/(admin)` folder to `src/app/admin`.
// Since I cannot rename folders, this file has been disabled by removing its
// default export.

export {};
