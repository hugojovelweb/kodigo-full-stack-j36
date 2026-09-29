export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-surface border border-line" />
        ))}
      </div>
    </div>
  );
}
