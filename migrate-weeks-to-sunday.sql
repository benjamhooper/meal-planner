-- Re-keys existing meal plans from Monday-start weeks (DayOfWeek 0=Mon..6=Sun)
-- to Sunday-start weeks (DayOfWeek 0=Sun..6=Sat).
-- Run this once, at the same time the Sunday-start API/web build is deployed.
-- Take a backup first. Aborts if any week is not currently Monday-based, so a
-- second run is rejected instead of corrupting data.

SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- 1900-01-01 was a Monday, so a Monday date has DATEDIFF(day, '19000101', d) % 7 = 0.
IF EXISTS (SELECT 1 FROM meal_plan_weeks WHERE DATEDIFF(day, '19000101', WeekStartDate) % 7 <> 0)
    THROW 50000, 'meal_plan_weeks contains a non-Monday WeekStartDate; migration already applied?', 1;

-- 1. Shift every week back one day (Monday -> the Sunday before it).
UPDATE meal_plan_weeks
SET WeekStartDate = DATEADD(day, -1, WeekStartDate);

-- 2. Old Sunday slots (DayOfWeek 6) belong to the following Sunday-start week
--    (shifted week start + 7). Make sure that week exists for each user.
SELECT s.Id AS SlotId, w.UserId, DATEADD(day, 7, w.WeekStartDate) AS TargetStart
INTO #sun
FROM meal_plan_slots s
JOIN meal_plan_weeks w ON w.Id = s.MealPlanWeekId
WHERE s.DayOfWeek = 6;

INSERT INTO meal_plan_weeks (Id, WeekStartDate, UserId, Notes, CreatedAt)
SELECT NEWID(), t.TargetStart, t.UserId, NULL, SYSUTCDATETIME()
FROM (SELECT DISTINCT UserId, TargetStart FROM #sun) t
WHERE NOT EXISTS (
    SELECT 1 FROM meal_plan_weeks w
    WHERE w.WeekStartDate = t.TargetStart
      AND (w.UserId = t.UserId OR (w.UserId IS NULL AND t.UserId IS NULL)));

-- Park the Sunday slots in their new week at DayOfWeek -1 to avoid unique index clashes.
UPDATE s
SET MealPlanWeekId = w.Id, DayOfWeek = -1
FROM meal_plan_slots s
JOIN #sun x ON x.SlotId = s.Id
JOIN meal_plan_weeks w
  ON w.WeekStartDate = x.TargetStart
 AND (w.UserId = x.UserId OR (w.UserId IS NULL AND x.UserId IS NULL));

-- 3. Old Mon..Sat (0..5) become 1..6 (two steps so the unique index never sees a duplicate).
UPDATE meal_plan_slots SET DayOfWeek = DayOfWeek + 10 WHERE DayOfWeek BETWEEN 0 AND 5;
UPDATE meal_plan_slots SET DayOfWeek = DayOfWeek - 9 WHERE DayOfWeek BETWEEN 10 AND 15;

-- 4. Parked Sunday slots become day 0 of their new week.
UPDATE meal_plan_slots SET DayOfWeek = 0 WHERE DayOfWeek = -1;

DROP TABLE #sun;

COMMIT TRANSACTION;
