type FrequencyString = "hourly" | "daily" | "weekly" | "monthly";

/**
 * Computes the next run date based on a frequency string
 * @param frequency The frequency string (e.g. "daily", "weekly", etc.)
 * @param fromDate Optional date to calculate from. Defaults to current date/time
 * @returns Date object representing the next run date
 */
export function computeNextRunDate(
  frequency: FrequencyString,
  fromDate: Date = new Date()
): Date {
  const nextDate = new Date(fromDate);

  switch (frequency) {
    case "hourly":
      nextDate.setHours(nextDate.getHours() + 1);
      break;

    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      // Reset to beginning of the day
      nextDate.setHours(0, 0, 0, 0);
      break;

    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      // Reset to beginning of the day
      nextDate.setHours(0, 0, 0, 0);
      break;

    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      // Reset to beginning of the day
      nextDate.setHours(0, 0, 0, 0);
      break;

    default:
      throw new Error(`Unsupported frequency: ${frequency}`);
  }

  return nextDate;
}
