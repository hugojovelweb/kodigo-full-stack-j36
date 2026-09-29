export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-[46vh] md:h-[56vh] bg-surface" />
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-14">
        <div className="h-4 w-2/3 bg-surface mb-4" />
        <div className="h-4 w-1/2 bg-surface" />
      </div>
    </div>
  );
}
