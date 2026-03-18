"use client";
import { useWeekMealPlan } from "@/hooks/useWeekMealPlan";
import { DayColumn } from "./DayColumn";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

interface WeekGridProps {
  weekStartDate: string;
}

export function WeekGrid({ weekStartDate }: WeekGridProps) {
  const { data: week, isLoading } = useWeekMealPlan(weekStartDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {DAYS.map((day, dayIndex) => (
        <DayColumn
          key={dayIndex}
          day={day}
          dayIndex={dayIndex}
          weekStartDate={weekStartDate}
          slots={week?.slots.filter((s) => s.dayOfWeek === dayIndex) || []}
        />
      ))}
    </div>
  );
}
