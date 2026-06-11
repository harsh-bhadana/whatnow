export function MediaCardSkeleton() {
  return (
    <div className="w-full rounded-2xl overflow-hidden flex flex-col bg-[var(--color-m3-surface-container)]/50 animate-pulse aspect-[2/3] relative">
      <div className="absolute top-2 left-2 w-12 h-5 rounded-full bg-[var(--color-m3-surface-container-high)]/50" />
      <div className="absolute top-2 right-2 w-12 h-5 rounded-full bg-[var(--color-m3-surface-container-high)]/50" />
      
      <div className="mt-auto p-4 flex flex-col gap-2">
        <div className="h-5 w-3/4 rounded bg-[var(--color-m3-surface-container-high)]/50" />
        <div className="h-3 w-1/2 rounded bg-[var(--color-m3-surface-container-high)]/50" />
      </div>
    </div>
  );
}
