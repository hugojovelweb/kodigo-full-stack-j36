import { formatName, typeColor } from "@/lib/pokemon-utils";

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className="type-badge" style={{ backgroundColor: typeColor(type) }}>
      {formatName(type)}
    </span>
  );
}
