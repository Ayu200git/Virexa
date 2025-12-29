export const SESSION_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
] as const;

//session status color bedge
export const SESSION_STATUS_COLORS: Record<string, string> = {
  scheduled:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

// Bookin status color
export const BOOKING_STATUS_COLORS: Record<string, string> = {
  confirmed:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  attended: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  noShow: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  inProgress:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

//status label map
const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  attended: "Attended",
  cancelled: "Cancelled",
  noShow: "No-show",
  inProgress: "In Progress",
};

// display label for booking status
export function getStatusLabel(status: string): string {
  return (
    STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1)
  );
}
export function getEffectiveStatus(
  status: string,
  classStartTime: Date,
  classDurationMinutes: number = 60
): string {
  if (status === "attended" || status === "cancelled") {
    return status;
  }

  if (status === "confirmed") {
    const now = new Date();
    const classEnd = new Date(
      classStartTime.getTime() + classDurationMinutes * 60 * 1000
    );
    
    //attandence window
    const attendanceWindowEnd = new Date(classEnd.getTime() + 60 * 60 * 1000);
    if (now >= classStartTime && now <= attendanceWindowEnd) {
      return "inProgress";
    }
    if (now > attendanceWindowEnd) {
      return "noShow";
    }
  }

  return status;
}
