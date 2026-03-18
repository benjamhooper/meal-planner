"use client";
import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { WeekGrid } from "@/components/meals/WeekGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatWeekLabel(monday: Date): string {
  const end = new Date(monday);
  end.setDate(monday.getDate() + 6);
  return `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default function MealsPage() {
  const [monday, setMonday] = useState(() => getMondayOfWeek(new Date()));

  const prevWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    setMonday(d);
  };

  const nextWeek = () => {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    setMonday(d);
  };

  const goToday = () => setMonday(getMondayOfWeek(new Date()));

  return (
    <>
      <TopBar
        title="Meal Plan"
        actions={
          <button onClick={goToday} className="text-xs text-green-600 font-medium px-2 py-1 rounded hover:bg-green-50">
            Today
          </button>
        }
      />
      <PageWrapper>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevWeek} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-700">{formatWeekLabel(monday)}</span>
          <button onClick={nextWeek} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
        <WeekGrid weekStartDate={formatDate(monday)} />
      </PageWrapper>
    </>
  );
}
