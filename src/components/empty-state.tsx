import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-8 text-center sm:p-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/30">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <p className="mt-4 font-display text-lg font-semibold">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
