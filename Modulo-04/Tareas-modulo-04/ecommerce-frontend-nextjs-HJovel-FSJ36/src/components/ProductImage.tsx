/* eslint-disable @next/next/no-img-element */
// Se usa <img> nativo porque la API puede servir imágenes desde cualquier host.
// width/height + aspect-ratio evitan layout shift (CLS); lazy salvo la prioritaria (LCP).
export function ProductImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex aspect-[4/3] items-center justify-center bg-slate-100 text-4xl text-slate-300 ${className}`}
      >
        🛍️
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={640}
      height={480}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`aspect-[4/3] w-full bg-slate-100 object-cover ${className}`}
    />
  );
}
