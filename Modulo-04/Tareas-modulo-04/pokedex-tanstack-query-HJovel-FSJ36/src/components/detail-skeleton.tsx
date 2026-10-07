export function DetailSkeleton() {
  return (
    <div className="detail" aria-busy="true" aria-live="polite">
      <div className="skeleton skeleton--hero" />
      <div className="skeleton skeleton--block" />
      <div className="skeleton skeleton--block" />
    </div>
  );
}
