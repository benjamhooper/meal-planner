"use client";
import { useState } from "react";
import { MealSlot } from "./MealSlot";
import type { MealPlanSlot } from "@/types";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

interface DayColumnProps {
  day: string;
  dayIndex: number;
  weekStartDate: string;
  slots: MealPlanSlot[];
}

export function DayColumn({ day, dayIndex, weekStartDate, slots }: DayColumnProps) {
  const today = new Date();
  const mondayDate = new Date(weekStartDate + "T00:00:00");
  const dayDate = new Date(mondayDate);
  dayDate.setDate(mondayDate.getDate() + dayIndex);
  const isToday =
    dayDate.getDate() === today.getDate() &&
    dayDate.getMonth() === today.getMonth() &&
    dayDate.getFullYear() === today.getFullYear();

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className={`px-3 py-2 flex items-center gap-2 ${isToday ? "bg-green-50" : "bg-gray-50"}`}>
        <span className={`text-sm font-semibold ${isToday ? "text-green-700" : "text-gray-700"}`}>{day}</span>
        <span className="text-xs text-gray-400">
          {dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        {isToday && <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full ml-auto">Today</span>}
      </div>
      <div className="divide-y divide-gray-100">
        {MEAL_TYPES.map((mealType) => (
          <MealSlot
            key={mealType}
            mealType={mealType}
            dayIndex={dayIndex}
            weekStartDate={weekStartDate}
            slot={slots.find((s) => s.mealType === mealType)}
          />
        ))}
      </div>
    </div>
  );
}
