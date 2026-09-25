import { getDatabase } from "@/lib/db";
import type { Platform, TrainingStatus } from "@/lib/domain";

export interface TrainingSessionInput {
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  platform: Platform;
  meetingUrl: string | null;
  meetingId: string | null;
  passcode: string | null;
  notes: string | null;
  jp: number;
}

type TrainingState = {
  id: number;
  status: TrainingStatus;
  starts_at: string;
  registration_deadline: string;
  minimum_attendance_jp: number;
};

function validTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(`${value}T00:00:00Z`).getTime());
}

export function addTrainingSession(trainingId: number, input: TrainingSessionInput): { ok: boolean; message: string; id?: number } {
  const database = getDatabase();
  const training = database.prepare("SELECT id, status, starts_at, registration_deadline, minimum_attendance_jp FROM trainings WHERE id = ?").get(trainingId) as TrainingState | undefined;
  if (!training) return { ok: false, message: "Diklat tidak ditemukan." };
  if (training.status !== "DRAFT") return { ok: false, message: "Sesi hanya dapat ditambahkan pada diklat draft." };
  if (!input.title.trim() || !validDate(input.sessionDate) || !validTime(input.startTime) || !validTime(input.endTime) || !Number.isInteger(input.jp) || input.jp <= 0) return { ok: false, message: "Data sesi belum lengkap atau tidak valid." };
  if (input.endTime <= input.startTime) return { ok: false, message: "Waktu selesai harus setelah waktu mulai." };
  const result = database.prepare(`
    INSERT INTO training_sessions (training_id, title, session_date, start_time, end_time, platform, meeting_url, meeting_id, passcode, recording_url, jp, notes, attendance_open)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, 1)
  `).run(trainingId, input.title.trim(), input.sessionDate, input.startTime, input.endTime, input.platform, input.meetingUrl || null, input.meetingId || null, input.passcode || null, input.jp, input.notes || null);
  return { ok: true, message: "Sesi ditambahkan.", id: Number(result.lastInsertRowid) };
}

export function publishTraining(trainingId: number): { ok: boolean; message: string } {
  const database = getDatabase();
  const transaction = database.transaction(() => {
    const training = database.prepare("SELECT id, status, starts_at, ends_at, registration_deadline, minimum_attendance_jp FROM trainings WHERE id = ?").get(trainingId) as (TrainingState & { ends_at: string }) | undefined;
    if (!training) return { ok: false, message: "Diklat tidak ditemukan." };
    if (training.status !== "DRAFT") return { ok: false, message: "Hanya diklat draft yang dapat diterbitkan." };
    if (!validDate(training.starts_at) || !validDate(training.ends_at) || !validDate(training.registration_deadline)) return { ok: false, message: "Tanggal diklat belum valid." };
    if (new Date(training.registration_deadline).getTime() > new Date(training.starts_at).getTime()) return { ok: false, message: "Batas pendaftaran harus sebelum kegiatan dimulai." };
    const totalJp = (database.prepare("SELECT COALESCE(SUM(jp), 0) AS value FROM training_sessions WHERE training_id = ?").get(trainingId) as { value: number }).value;
    if (totalJp <= 0) return { ok: false, message: "Tambahkan minimal satu sesi dengan JP sebelum menerbitkan diklat." };
    if (training.minimum_attendance_jp > totalJp) return { ok: false, message: `JP minimum hadir (${training.minimum_attendance_jp}) tidak boleh melebihi total JP (${totalJp}).` };
    database.prepare("UPDATE trainings SET status = 'PUBLISHED' WHERE id = ? AND status = 'DRAFT'").run(trainingId);
    return { ok: true, message: "Diklat berhasil diterbitkan." };
  });
  return transaction.immediate();
}

export function assignFacilitator(trainingId: number, facilitatorId: number): { ok: boolean; message: string } {
  const database = getDatabase();
  const training = database.prepare("SELECT id, status FROM trainings WHERE id = ?").get(trainingId) as { id: number; status: string } | undefined;
  const facilitator = database.prepare("SELECT id FROM users WHERE id = ? AND role = 'FACILITATOR'").get(facilitatorId) as { id: number } | undefined;
  if (!training || !facilitator) return { ok: false, message: "Diklat atau fasilitator tidak ditemukan." };
  if (training.status === "COMPLETED" || training.status === "ARCHIVED") return { ok: false, message: "Fasilitator tidak dapat ditambahkan ke program selesai." };
  database.prepare("INSERT OR IGNORE INTO training_facilitators (training_id, facilitator_id) VALUES (?, ?)").run(trainingId, facilitatorId);
  return { ok: true, message: "Fasilitator ditugaskan." };
}

export function canFacilitateTraining(trainingId: number, facilitatorId: number): boolean {
  return Boolean(getDatabase().prepare("SELECT 1 FROM training_facilitators WHERE training_id = ? AND facilitator_id = ?").get(trainingId, facilitatorId));
}
