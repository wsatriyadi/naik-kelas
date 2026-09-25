"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole, requireUser } from "@/lib/access";
import { authenticateUser, createRegistration, createTraining, getRegistrationTrainingId, recordAttendance, recordScores, updateRegistrationStatus, issueCertificate } from "@/lib/repository";
import { getCurrentUser } from "@/lib/session";
import { addTrainingSession, assignFacilitator, canFacilitateTraining, publishTraining } from "@/lib/training-management";
import { createSessionToken, safeRedirectPath, sessionCookie } from "@/lib/security";
import type { AttendanceStatus } from "@/lib/domain";

export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

const loginSchema = z.object({
  email: z.email("Masukkan email yang valid."),
  password: z.string().min(1, "Masukkan password.").max(128, "Password terlalu panjang."),
  redirectTo: z.string().optional(),
});

export async function loginAction(_previous: ActionState | null, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Periksa kembali email dan password.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const user = authenticateUser(parsed.data.email, parsed.data.password);
  if (!user) return { ok: false, message: "Email atau password tidak cocok." };
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie.name, createSessionToken(user.id), sessionCookie.options);
  redirect(safeRedirectPath(parsed.data.redirectTo, user.role === "PARTICIPANT" ? "/peserta" : "/dashboard"));
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookie.name);
  redirect("/masuk");
}

export async function registerTrainingAction(_previous: ActionState | null, formData: FormData): Promise<ActionState> {
  const user = requireUser(await getCurrentUser());
  const parsedId = z.coerce.number().int().positive().safeParse(formData.get("trainingId"));
  if (!parsedId.success) return { ok: false, message: "Diklat tidak valid." };
  const result = createRegistration(parsedId.data, user.id);
  if (!result.ok) return result;
  redirect("/peserta");
}

const isoDate = z.string().trim().refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(`${value}T00:00:00Z`).getTime()), "Tanggal tidak valid.");
const trainingSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter.").max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  subtitle: z.string().trim().min(3, "Subjudul wajib diisi.").max(180),
  description: z.string().trim().min(10, "Deskripsi minimal 10 karakter."),
  objectives: z.string().trim().min(3, "Tujuan wajib diisi."),
  category: z.string().trim().min(2, "Kategori wajib diisi."),
  method: z.enum(["ONLINE", "OFFLINE", "HYBRID"]),
  platform: z.enum(["ZOOM", "GOOGLE_MEET", "MICROSOFT_TEAMS", "OTHER", "ONSITE"]),
  location: z.string().trim().optional(),
  facilitator: z.string().trim().min(3, "Fasilitator wajib diisi.").max(120),
  price: z.coerce.number().int().min(0).max(100_000_000),
  quota: z.coerce.number().int().min(1).max(10_000),
  startsAt: isoDate,
  endsAt: isoDate,
  registrationDeadline: isoDate,
  passScore: z.coerce.number().int().min(0).max(100),
  minimumAttendanceJp: z.coerce.number().int().min(0).max(10_000),
  certificateLabel: z.string().trim().min(3, "Label sertifikat wajib diisi.").max(80),
  posterTone: z.enum(["indigo", "teal", "orange", "plum"]),
});

export async function createTrainingAction(_previous: ActionState | null, formData: FormData): Promise<ActionState> {
  requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN"]);
  const parsed = trainingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Data diklat belum lengkap.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const input = parsed.data;
  if (new Date(input.startsAt).getTime() > new Date(input.endsAt).getTime()) return { ok: false, message: "Tanggal selesai harus setelah tanggal mulai." };
  if (new Date(input.registrationDeadline).getTime() > new Date(input.startsAt).getTime()) return { ok: false, message: "Batas pendaftaran harus sebelum kegiatan dimulai." };
  const result = createTraining({
    title: input.title,
    slug: input.slug,
    subtitle: input.subtitle,
    description: input.description,
    objectives: input.objectives,
    category: input.category,
    method: input.method,
    platform: input.platform,
    location: input.location || null,
    facilitator: input.facilitator,
    price: input.price,
    quota: input.quota,
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString(),
    registrationDeadline: new Date(input.registrationDeadline).toISOString(),
    passScore: input.passScore,
    minimumAttendanceJp: input.minimumAttendanceJp,
    certificateLabel: input.certificateLabel.toUpperCase(),
    posterTone: input.posterTone,
  });
  if (!result.ok || !result.id) return { ok: false, message: result.message };
  redirect(`/dashboard/diklat/${result.id}?created=1`);
}

export async function updateRegistrationStatusAction(_previous: ActionState | null, formData: FormData): Promise<ActionState> {
  const user = requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN", "VERIFIER"]);
  const id = z.coerce.number().int().positive().parse(formData.get("registrationId"));
  const status = z.enum(["PENDING", "VERIFIED", "REJECTED", "PAID", "COMPLETED", "CANCELLED"]).parse(formData.get("status"));
  return updateRegistrationStatus(id, status, user.role);
}

export async function recordAttendanceAction(_previous: ActionState | null, formData: FormData): Promise<ActionState> {
  const user = requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN", "FACILITATOR"]);
  const registrationId = z.coerce.number().int().positive().parse(formData.get("registrationId"));
  const sessionId = z.coerce.number().int().positive().parse(formData.get("sessionId"));
  const status = z.enum(["PRESENT", "LATE", "EXCUSED", "ABSENT"]).parse(formData.get("status")) as AttendanceStatus;
  const trainingId = getRegistrationTrainingId(registrationId);
  if (user.role === "FACILITATOR" && (trainingId === null || !canFacilitateTraining(trainingId, user.id))) return { ok: false, message: "Anda bukan fasilitator yang ditugaskan untuk program ini." };
  return recordAttendance(registrationId, sessionId, status);
}

export async function recordScoresAction(_previous: ActionState | null, formData: FormData): Promise<ActionState> {
  const user = requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN", "FACILITATOR"]);
  const registrationId = z.coerce.number().int().positive().parse(formData.get("registrationId"));
  const postTest = z.coerce.number().int().min(0).max(100).parse(formData.get("postTest"));
  const task = z.coerce.number().int().min(0).max(100).parse(formData.get("task"));
  const trainingId = getRegistrationTrainingId(registrationId);
  if (user.role === "FACILITATOR" && (trainingId === null || !canFacilitateTraining(trainingId, user.id))) return { ok: false, message: "Anda bukan fasilitator yang ditugaskan untuk program ini." };
  return recordScores(registrationId, { postTest, task });
}

export async function issueCertificateAction(_previous: ActionState | null, formData: FormData): Promise<ActionState> {
  requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN"]);
  const registrationId = z.coerce.number().int().positive().parse(formData.get("registrationId"));
  return issueCertificate(registrationId);
}

const sessionSchema = z.object({
  trainingId: z.coerce.number().int().positive(),
  title: z.string().trim().min(3).max(120),
  sessionDate: z.string().trim(),
  startTime: z.string().trim(),
  endTime: z.string().trim(),
  platform: z.enum(["ZOOM", "GOOGLE_MEET", "MICROSOFT_TEAMS", "OTHER", "ONSITE"]),
  meetingUrl: z.string().trim().url().optional().or(z.literal("")),
  meetingId: z.string().trim().optional(),
  passcode: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  jp: z.coerce.number().int().positive().max(1_000),
});

export async function addTrainingSessionAction(formData: FormData): Promise<void> {
  requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN"]);
  const parsed = sessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  addTrainingSession(parsed.data.trainingId, { title: parsed.data.title, sessionDate: parsed.data.sessionDate, startTime: parsed.data.startTime, endTime: parsed.data.endTime, platform: parsed.data.platform, meetingUrl: parsed.data.meetingUrl || null, meetingId: parsed.data.meetingId || null, passcode: parsed.data.passcode || null, notes: parsed.data.notes || null, jp: parsed.data.jp });
}

export async function publishTrainingAction(formData: FormData): Promise<void> {
  requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN"]);
  const trainingId = z.coerce.number().int().positive().parse(formData.get("trainingId"));
  publishTraining(trainingId);
}

export async function assignFacilitatorAction(formData: FormData): Promise<void> {
  requireRole(await getCurrentUser(), ["SUPER_ADMIN", "ADMIN"]);
  const trainingId = z.coerce.number().int().positive().parse(formData.get("trainingId"));
  const facilitatorId = z.coerce.number().int().positive().parse(formData.get("facilitatorId"));
  assignFacilitator(trainingId, facilitatorId);
}
