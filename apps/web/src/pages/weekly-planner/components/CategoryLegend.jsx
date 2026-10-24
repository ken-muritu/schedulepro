import React from "react";

const CATEGORIES = [
  { key: "work", label: "Work", dot: "#3B82F6" },
  { key: "languages", label: "Languages", dot: "#FBBF24" },
  { key: "literature", label: "Literature", dot: "#F97316" },
  { key: "coding", label: "Coding", dot: "#10B981" },
  { key: "leadership", label: "Leadership", dot: "#A855F7" },
  { key: "spirituality", label: "Spirituality", dot: "#8B5CF6" },
  { key: "chores", label: "Chores", dot: "#F43F5E" },
  { key: "meals", label: "Meals", dot: "#EAB308" },
  { key: "leisure", label: "Leisure", dot: "#94A3B8" },
];

const CategoryLegend = ({ taskCounts }) => {
  const active = CATEGORIES?.filter((c) => (taskCounts?.[c?.key] || 0) > 0);
  const display = active?.length > 0 ? active : CATEGORIES;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 py-2">
      {display?.map((cat) => (
        <div key={cat?.key} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat?.dot }} />
          <span className="font-caption text-xs text-muted-foreground">{cat?.label}</span>
          {taskCounts?.[cat?.key] > 0 && (
            <span className="font-data text-xs text-muted-foreground">({taskCounts?.[cat?.key]})</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryLegend;