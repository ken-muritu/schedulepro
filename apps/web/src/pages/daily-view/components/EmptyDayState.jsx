import React from "react";
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyDayState = ({ onAddTask }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center mb-4">
      <Icon name="CalendarOff" size={28} color="var(--color-muted-foreground)" />
    </div>
    <h3 className="font-heading font-semibold text-lg text-[var(--color-foreground)] mb-2">
      No blocks scheduled
    </h3>
    <p className="font-body text-sm text-[var(--color-muted-foreground)] max-w-xs mb-6">
      This day has no time blocks yet. Add your first block to start planning.
    </p>
    <Button variant="default" onClick={onAddTask} iconName="Plus" iconPosition="left" iconSize={16}>
      Add Time Block
    </Button>
  </div>
);

export default EmptyDayState;