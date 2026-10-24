import React from "react";

const CATEGORY_COLORS = {
  work: "var(--color-work)",
  languages: "var(--color-learning)",
  literature: "var(--color-creative)",
  coding: "var(--color-health)",
  leadership: "var(--color-accent)",
  spirituality: "var(--color-personal)",
  chores: "var(--color-destructive)",
  meals: "var(--color-warning)",
  leisure: "var(--color-secondary)",
};

const CATEGORY_LABELS = {
  work: "Work",
  languages: "Languages",
  literature: "Literature",
  coding: "Coding",
  leadership: "Leadership",
  spirituality: "Spirituality",
  chores: "Chores",
  meals: "Meals",
  leisure: "Leisure",
};

const FocusAreaBreakdown = ({ breakdown }) => {
  const maxHours = Math.max(...breakdown?.map((b) => b?.hours), 1);

  return (
    <div className="card p-4 md:p-5">
      <h2 className="font-heading text-base font-semibold text-[var(--color-foreground)] mb-4">
        Focus Areas Today
      </h2>
      <div className="flex flex-col gap-3">
        {breakdown?.map((item) => {
          const color = CATEGORY_COLORS?.[item?.category] || "var(--color-primary)";
          const label = CATEGORY_LABELS?.[item?.category] || item?.category;
          const pct = (item?.hours / maxHours) * 100;
          return (
            <div key={item?.category} className="flex items-center gap-3">
              <div className="w-20 md:w-24 flex-shrink-0">
                <span className="font-caption text-xs text-[var(--color-muted-foreground)] truncate block">
                  {label}
                </span>
              </div>
              <div className="flex-1 h-2.5 bg-[var(--color-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <div className="w-12 text-right flex-shrink-0">
                <span className="font-data text-xs text-[var(--color-foreground)] whitespace-nowrap">
                  {item?.hours?.toFixed(1)}h
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FocusAreaBreakdown;