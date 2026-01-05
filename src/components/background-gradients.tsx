export function BackgroundGradients() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-linear-to-br from-primary/7 to-violet-500/7 blur-3xl dark:hidden" />
      <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-linear-to-br from-violet-500/7 to-primary/7 blur-3xl dark:hidden" />
      <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-linear-to-br from-primary/7 to-muted/30 blur-3xl dark:hidden" />
    </div>
  );
}

