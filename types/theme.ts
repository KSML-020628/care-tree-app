export type ThemeStatus = "ACTIVE" | "UPCOMING" | "CLOSED";

export interface WeeklyTheme {
  id: string;
  title: string;
  description: string;
  fullImagePath: string;
  startsAt: string;
  endsAt: string;
  status: ThemeStatus;
}
