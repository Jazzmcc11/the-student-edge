type Props = {
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
};

function initials(name?: string | null) {
  if (!name) return "P";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function AvatarBadge({ name, size = "md", className = "" }: Props) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-gold font-display font-bold text-primary-foreground shadow-gold ${SIZES[size]} ${className}`}
      aria-label={name || "avatar"}
    >
      {initials(name)}
    </div>
  );
}
