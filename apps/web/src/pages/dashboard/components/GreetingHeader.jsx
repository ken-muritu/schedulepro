import React from "react";
import Icon from '../../../components/AppIcon';

const GreetingHeader = ({ greeting, todayLabel, taskCount }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon name="Sun" size={20} color="var(--color-warning)" strokeWidth={2} />
        <span className="font-caption text-sm text-[var(--color-muted-foreground)]">{todayLabel}</span>
      </div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-foreground)]">
        {greeting}
      </h1>
      <p className="font-body text-sm text-[var(--color-muted-foreground)]">
        You have{" "}
        <span className="font-semibold text-[var(--color-primary)]">{taskCount} blocks</span>{" "}
        scheduled today
      </p>
    </div>
  );
};

export default GreetingHeader;