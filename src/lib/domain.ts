export const roles = ["SUPER_ADMIN", "ADMIN", "FACILITATOR", "VERIFIER", "LEADER", "PARTICIPANT"] as const;
export type Role = (typeof roles)[number];

export const trainingStatuses = ["DRAFT", "PUBLISHED", "ONGOING", "COMPLETED", "ARCHIVED"] as const;
export type TrainingStatus = (typeof trainingStatuses)[number];

export const registrationStatuses = ["PENDING", "VERIFIED", "REJECTED", "PAID", "COMPLETED", "CANCELLED"] as const;
export type RegistrationStatus = (typeof registrationStatuses)[number];

export const platforms = ["ZOOM", "GOOGLE_MEET", "MICROSOFT_TEAMS", "OTHER", "ONSITE"] as const;
export type Platform = (typeof platforms)[number];

export const resultStatuses = ["PENDING", "PASSED", "FAILED"] as const;
export type ResultStatus = (typeof resultStatuses)[number];

export const attendanceWeights = {
  PRESENT: 1,
  LATE: 0.75,
  EXCUSED: 0.5,
  ABSENT: 0,
} as const;

export type AttendanceStatus = keyof typeof attendanceWeights;

export const gradeLabels: Record<ResultStatus, string> = {
  PENDING: "Belum dinilai",
  PASSED: "Lulus",
  FAILED: "Belum Lulus",
};

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin Diklat",
  FACILITATOR: "Fasilitator",
  VERIFIER: "Verifikator",
  LEADER: "Pimpinan",
  PARTICIPANT: "Peserta",
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface SessionUser extends User {
  institution: string;
}

export interface Training {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  objectives: string;
  category: string;
  method: "ONLINE" | "OFFLINE" | "HYBRID";
  platform: Platform;
  location: string | null;
  posterUrl: string | null;
  totalJp: number;
  price: number;
  quota: number;
  status: TrainingStatus;
  passScore: number;
  attendanceWeight: number;
  taskWeight: number;
  postTestWeight: number;
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  minimumAttendanceJp: number;
  certificateLabel: string;
  facilitator: string;
  createdAt: string;
}

export interface TrainingSession {
  id: number;
  trainingId: number;
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  platform: Platform;
  meetingUrl: string | null;
  meetingId: string | null;
  passcode: string | null;
  recordingUrl: string | null;
  jp: number;
  notes: string | null;
  attendanceOpen: boolean;
}

export interface Registration {
  id: number;
  trainingId: number;
  participantId: number;
  status: RegistrationStatus;
  preTestScore: number | null;
  postTestScore: number | null;
  taskScore: number | null;
  attendanceScore: number | null;
  finalScore: number | null;
  resultStatus: ResultStatus;
  earnedJp: number;
  registeredAt: string;
  verifiedAt: string | null;
}

export interface Certificate {
  id: number;
  certificateNumber: string;
  trainingId: number;
  registrationId: number;
  participantId: number;
  issuedAt: string;
  revokedAt: string | null;
  totalJp: number;
  earnedJp: number;
  finalScore: number | null;
  verificationCode: string;
}

export interface TrainingDetail extends Training {
  sessions: TrainingSession[];
}
export interface ParticipantRegistration extends Registration {
  title: string;
  slug: string;
  subtitle: string;
  category: string;
  method: Training["method"];
  posterUrl: string | null;
  totalJp: number;
  startsAt: string;
  endsAt: string;
  registrationDeadline: string;
  minimumAttendanceJp: number;
  certificateLabel: string;
  facilitator: string;
  sessions: TrainingSession[];
  attendance: Array<{ sessionId: number; status: AttendanceStatus }>;
  certificate: Certificate | null;
}

export interface DashboardStats {
  totalTrainings: number;
  activeTrainings: number;
  pendingRegistrations: number;
  totalParticipants: number;
  passedParticipants: number;
  failedParticipants: number;
  issuedCertificates: number;
  completionRate: number;
  averageScore: number;
}

export function calculateFinalScore(input: {
  attendanceScore: number;
  taskScore: number;
  postTestScore: number;
  attendanceWeight: number;
  taskWeight: number;
  postTestWeight: number;
}): number {
  return Math.round(
    (input.attendanceScore * input.attendanceWeight +
      input.taskScore * input.taskWeight +
      input.postTestScore * input.postTestWeight) / 100,
  );
}

export function isTrainingOpen(training: Pick<Training, "status" | "quota" | "registrationDeadline">): boolean {
  if (training.status !== "PUBLISHED") return false;
  if (training.quota <= 0) return false;
  if (new Date(training.registrationDeadline).getTime() < Date.now()) return false;
  return true;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
    ...options,
  }).format(new Date(value));
}

export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return formatDate(start);
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function gradeFromScore(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
}
