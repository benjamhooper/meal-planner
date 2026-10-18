"use client";
import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { WeekGrid } from "@/components/meals/WeekGrid";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getSundayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatWeekLabel(sunday: Date): string {
  const end = new Date(sunday);
  end.setDate(sunday.getDate() + 6);
  return `${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default function MealsPage() {
  const [sunday, setSunday] = useState(() => getSundayOfWeek(new Date()));

  const prevWeek = () => {
    const d = new Date(sunday);
    d.setDate(d.getDate() - 7);
    setSunday(d);
  };

  const nextWeek = () => {
    const d = new Date(sunday);
    d.setDate(d.getDate() + 7);
    setSunday(d);
  };

  const goToday = () => setSunday(getSundayOfWeek(new Date()));

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
          <span className="text-sm font-medium text-gray-700">{formatWeekLabel(sunday)}</span>
          <button onClick={nextWeek} className="p-2 rounded-full hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
        </div>
        <WeekGrid weekStartDate={formatDate(sunday)} />
      </PageWrapper>
    </>
  );
}
