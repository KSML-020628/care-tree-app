export type Quadrant = "TOP_LEFT" | "TOP_RIGHT" | "BOTTOM_LEFT" | "BOTTOM_RIGHT";

export type AssignmentStatus = "ASSIGNED" | "DRAWING" | "SUBMITTED";

export interface DrawingAssignment {
  id: string;
  userId: string;
  roomId: string;
  themeId: string;
  quadrant: Quadrant;
  status: AssignmentStatus;
  assignedAt: string;
}

export interface DrawingSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  quadrant: Quadrant;
  imageDataUrl: string;
  submittedAt: string;
}
