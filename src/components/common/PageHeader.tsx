import type { ReactNode } from "react";
import { DemoBadge } from "./DemoBadge";

export function PageHeader({
  title,
  description,
  actions,
  demo = false,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  demo?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {demo && <DemoBadge className="mb-3" />}
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
