import { randomBytes } from "node:crypto";
import { getDatabase } from "@/lib/db";
import { calculateFinalScore, type AttendanceStatus, type Certificate, type DashboardStats, type ParticipantRegistration, type RegistrationStatus, type Role, type SessionUser, type Training, type TrainingDetail, type TrainingSession, type TrainingStatus, type User } from "@/lib/domain";
import { hashPassword, verifyPassword } from "@/lib/security";

const userSelect = "id, name, email, role, institution, phone";

type UserRow = User & { institution: string; phone: string };

type TrainingRow = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  objectives: string;
  category: string;
  method: Training["method"];
  platform: Training["platform"];
  location: string | null;
  poster_url: string | null;
  price: number;
  quota: number;
  status: TrainingStatus;
  pass_score: number;
  attendance_weight: number;
  task_weight: number;
  post_test_weight: number;
  starts_at: string;
  ends_at: string;
  registration_deadline: string;
  minimum_attendance_jp: number;
  certificate_label: string;
  facilitator: string;
  created_at: string;
  total_jp?: number;
};

type SessionRow = {
  id: number;
  training_id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  platform: Training["platform"];
  meeting_url: string | null;
  meeting_id: string | null;
  passcode: string | null;
  recording_url: string | null;
  jp: number;
  notes: string | null;
  attendance_open: number;
};

type RegistrationRow = {
  id: number;
  training_id: number;
  participant_id: number;
  status: string;
  pre_test_score: number | null;
  post_test_score: number | null;
  task_score: number | null;
  attendance_score: number | null;
  final_score: number | null;
  result_status: string;
  earned_jp: number;
  registered_at: string;
  verified_at: string | null;
};

type CertificateRow = {
  id: number;
  certificate_number: string;
  training_id: number;
  registration_id: number;
  participant_id: number;
  issued_at: string;
  revoked_at: string | null;
  total_jp: number;
  earned_jp: number;
  final_score: number | null;
  verification_code: string;
};

function mapTraining(row: TrainingRow): Training {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    objectives: row.objectives,
    category: row.category,
    method: row.method,
    platform: row.platform,
    location: row.location,
    posterUrl: row.poster_url,
    totalJp: row.total_jp ?? 0,
    price: row.price,
    quota: row.quota,
    status: row.status,
    passScore: row.pass_score,
    attendanceWeight: row.attendance_weight,
    taskWeight: row.task_weight,
    postTestWeight: row.post_test_weight,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    registrationDeadline: row.registration_deadline,
    minimumAttendanceJp: row.minimum_attendance_jp,
    certificateLabel: row.certificate_label,
    facilitator: row.facilitator,
    createdAt: row.created_at,
  };
}

function mapSession(row: SessionRow): TrainingSession {
  return {
    id: row.id,
    trainingId: row.training_id,
    title: row.title,
    sessionDate: row.session_date,
    startTime: row.start_time,
    endTime: row.end_time,
    platform: row.platform,
    meetingUrl: row.meeting_url,
    meetingId: row.meeting_id,
    passcode: row.passcode,
    recordingUrl: row.recording_url,
    jp: row.jp,
    notes: row.notes,
    attendanceOpen: row.attendance_open === 1,
  };
}

function mapRegistration(row: RegistrationRow): ParticipantRegistration {
  const database = getDatabase();
  const training = database.prepare("SELECT * FROM trainings WHERE id = ?").get(row.training_id) as TrainingRow;
  const sessions = database.prepare("SELECT * FROM training_sessions WHERE training_id = ? ORDER BY session_date, start_time").all(row.training_id) as SessionRow[];
  const attendance = database.prepare("SELECT session_id, status FROM attendance WHERE registration_id = ?").all(row.id) as Array<{ session_id: number; status: AttendanceStatus }>;
  const certificate = database.prepare("SELECT * FROM certificates WHERE registration_id = ?").get(row.id) as CertificateRow | undefined;
  return {
    id: row.id,
    trainingId: row.training_id,
    participantId: row.participant_id,
    status: row.status as ParticipantRegistration["status"],
    preTestScore: row.pre_test_score,
    postTestScore: row.post_test_score,
    taskScore: row.task_score,
    attendanceScore: row.attendance_score,
    finalScore: row.final_score,
    resultStatus: row.result_status as ParticipantRegistration["resultStatus"],
    earnedJp: row.earned_jp,
    registeredAt: row.registered_at,
    verifiedAt: row.verified_at,
    title: training.title,
    slug: training.slug,
    subtitle: training.subtitle,
    category: training.category,
    method: training.method,
    posterUrl: training.poster_url,
    totalJp: sessions.reduce((sum, session) => sum + session.jp, 0),
    startsAt: training.starts_at,
    endsAt: training.ends_at,
    registrationDeadline: training.registration_deadline,
    minimumAttendanceJp: training.minimum_attendance_jp,
    certificateLabel: training.certificate_label,
    facilitator: training.facilitator,
    sessions: sessions.map(mapSession),
    attendance: attendance.map((item) => ({ sessionId: item.session_id, status: item.status })),
    certificate: certificate ? mapCertificate(certificate) : null,
  };
}

function mapCertificate(row: CertificateRow): Certificate {
  return {
    id: row.id,
    certificateNumber: row.certificate_number,
    trainingId: row.training_id,
    registrationId: row.registration_id,
    participantId: row.participant_id,
    issuedAt: row.issued_at,
    revokedAt: row.revoked_at,
    totalJp: row.total_jp,
    earnedJp: row.earned_jp,
    finalScore: row.final_score,
    verificationCode: row.verification_code,
  };
}

export function findUserByEmail(email: string): (User & { institution: string; phone: string; passwordHash: string }) | null {
  const row = getDatabase().prepare(`SELECT ${userSelect}, password_hash FROM users WHERE lower(email) = lower(?)`).get(email) as (UserRow & { password_hash: string }) | undefined;
  if (!row) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, institution: row.institution, phone: row.phone, passwordHash: row.password_hash };
}

export function authenticateUser(email: string, password: string): User | null {
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function getUserById(id: number): SessionUser | null {
  const row = getDatabase().prepare(`SELECT ${userSelect} FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  if (!row) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, institution: row.institution };
}

export function listTrainings(options: { publishedOnly?: boolean; search?: string } = {}): Training[] {
  const conditions: string[] = [];
  const params: string[] = [];
  if (options.publishedOnly) conditions.push("status IN ('PUBLISHED','ONGOING')");
  if (options.search) {
    conditions.push("(title LIKE ? OR category LIKE ? OR description LIKE ?)");
    const search = `%${options.search}%`;
    params.push(search, search, search);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = getDatabase().prepare(`SELECT t.*, COALESCE((SELECT SUM(s.jp) FROM training_sessions s WHERE s.training_id = t.id), 0) AS total_jp FROM trainings t ${where.replaceAll("status", "t.status")} ORDER BY CASE t.status WHEN 'ONGOING' THEN 0 WHEN 'PUBLISHED' THEN 1 ELSE 2 END, t.starts_at ASC`).all(...params) as TrainingRow[];
  return rows.map(mapTraining);
}

export function getTrainingBySlug(slug: string, options: { publicOnly?: boolean } = {}): TrainingDetail | null {
  const database = getDatabase();
  const row = database.prepare(`SELECT t.*, COALESCE((SELECT SUM(s.jp) FROM training_sessions s WHERE s.training_id = t.id), 0) AS total_jp FROM trainings t WHERE t.slug = ? ${options.publicOnly ? "AND t.status IN ('PUBLISHED','ONGOING')" : ""}`).get(slug) as TrainingRow | undefined;
  if (!row) return null;
  const sessions = database.prepare("SELECT * FROM training_sessions WHERE training_id = ? ORDER BY session_date, start_time").all(row.id) as SessionRow[];
  return { ...mapTraining(row), sessions: sessions.map(mapSession) };
}

export function getTrainingById(id: number): TrainingDetail | null {
  const database = getDatabase();
  const row = database.prepare(`SELECT t.*, COALESCE((SELECT SUM(s.jp) FROM training_sessions s WHERE s.training_id = t.id), 0) AS total_jp FROM trainings t WHERE t.id = ?`).get(id) as TrainingRow | undefined;
  if (!row) return null;
  const sessions = database.prepare("SELECT * FROM training_sessions WHERE training_id = ? ORDER BY session_date, start_time").all(id) as SessionRow[];
  return { ...mapTraining(row), sessions: sessions.map(mapSession) };
}

export function getDashboardStats(): DashboardStats {
  const database = getDatabase();
  const count = (sql: string) => (database.prepare(sql).get() as { count: number }).count;
  const totalParticipants = count("SELECT COUNT(*) AS count FROM registrations WHERE status != 'REJECTED'");
  const passedParticipants = count("SELECT COUNT(*) AS count FROM registrations WHERE result_status = 'PASSED'");
  const completedRegistrations = count("SELECT COUNT(*) AS count FROM registrations WHERE result_status != 'PENDING'");
  const average = database.prepare("SELECT COALESCE(AVG(final_score), 0) AS value FROM registrations WHERE final_score IS NOT NULL").get() as { value: number };
  return {
    totalTrainings: count("SELECT COUNT(*) AS count FROM trainings WHERE status != 'ARCHIVED'"),
    activeTrainings: count("SELECT COUNT(*) AS count FROM trainings WHERE status IN ('PUBLISHED','ONGOING')"),
    pendingRegistrations: count("SELECT COUNT(*) AS count FROM registrations WHERE status = 'PENDING'"),
    totalParticipants,
    passedParticipants,
    failedParticipants: count("SELECT COUNT(*) AS count FROM registrations WHERE result_status = 'FAILED'"),
    issuedCertificates: count("SELECT COUNT(*) AS count FROM certificates WHERE revoked_at IS NULL"),
    completionRate: completedRegistrations ? Math.round((passedParticipants / completedRegistrations) * 100) : 0,
    averageScore: Math.round(average.value),
  };
}

export function getMonthlyParticipantData(): Array<{ month: string; value: number }> {
  const rows = getDatabase().prepare("SELECT substr(registered_at, 1, 7) AS month, COUNT(*) AS value FROM registrations GROUP BY month ORDER BY month ASC").all() as Array<{ month: string; value: number }>;
  return rows.map((row) => ({ month: new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "Asia/Jakarta" }).format(new Date(`${row.month}-01T00:00:00Z`)), value: row.value }));
}

export function listRecentTrainings(limit = 5): Training[] {
  return (getDatabase().prepare("SELECT * FROM trainings ORDER BY created_at DESC LIMIT ?").all(limit) as TrainingRow[]).map(mapTraining);
}

export interface RegistrationListItem extends RegistrationRow {
  participant_name: string;
  participant_email: string;
  participant_institution: string;
  training_title: string;
  training_slug: string;
  training_status: TrainingStatus;
  total_jp: number;
}

export function listRegistrations(options: { trainingId?: number; status?: string; participantId?: number } = {}): RegistrationListItem[] {
  const conditions: string[] = [];
  const params: Array<number | string> = [];
  if (options.trainingId) { conditions.push("r.training_id = ?"); params.push(options.trainingId); }
  if (options.status) { conditions.push("r.status = ?"); params.push(options.status); }
  if (options.participantId) { conditions.push("r.participant_id = ?"); params.push(options.participantId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return getDatabase().prepare(`
    SELECT r.*, u.name AS participant_name, u.email AS participant_email, u.institution AS participant_institution,
      t.title AS training_title, t.slug AS training_slug, t.status AS training_status,
      COALESCE((SELECT SUM(s.jp) FROM training_sessions s WHERE s.training_id = t.id), 0) AS total_jp
    FROM registrations r
    JOIN users u ON u.id = r.participant_id
    JOIN trainings t ON t.id = r.training_id
    ${where}
    ORDER BY r.registered_at DESC
  `).all(...params) as RegistrationListItem[];
}

export function getParticipantRegistrations(participantId: number): ParticipantRegistration[] {
  const rows = getDatabase().prepare("SELECT * FROM registrations WHERE participant_id = ? ORDER BY registered_at DESC").all(participantId) as RegistrationRow[];
  return rows.map(mapRegistration);
}
export function getRegistrationTrainingId(registrationId: number): number | null {
  const row = getDatabase().prepare("SELECT training_id FROM registrations WHERE id = ?").get(registrationId) as { training_id: number } | undefined;
  return row?.training_id ?? null;
}


export function getRegistrationById(id: number): ParticipantRegistration | null {
  const row = getDatabase().prepare("SELECT * FROM registrations WHERE id = ?").get(id) as RegistrationRow | undefined;
  return row ? mapRegistration(row) : null;
}

export function getCertificateById(id: number): Certificate | null {
  const row = getDatabase().prepare("SELECT * FROM certificates WHERE id = ?").get(id) as CertificateRow | undefined;
  return row ? mapCertificate(row) : null;
}

export function getCertificateByCode(code: string): (Certificate & { participantName: string; participantEmail: string; participantInstitution: string; trainingTitle: string; trainingSubtitle: string; facilitator: string; startsAt: string; endsAt: string }) | null {
  const row = getDatabase().prepare(`
    SELECT c.*, u.name AS participant_name, u.email AS participant_email, u.institution AS participant_institution,
      t.title AS training_title, t.subtitle AS training_subtitle, t.facilitator, t.starts_at, t.ends_at
    FROM certificates c
    JOIN users u ON u.id = c.participant_id
    JOIN trainings t ON t.id = c.training_id
    WHERE c.verification_code = ? AND c.revoked_at IS NULL
  `).get(code) as (CertificateRow & { participant_name: string; participant_email: string; participant_institution: string; training_title: string; training_subtitle: string; facilitator: string; starts_at: string; ends_at: string }) | undefined;
  if (!row) return null;
  return { ...mapCertificate(row), participantName: row.participant_name, participantEmail: row.participant_email, participantInstitution: row.participant_institution, trainingTitle: row.training_title, trainingSubtitle: row.training_subtitle, facilitator: row.facilitator, startsAt: row.starts_at, endsAt: row.ends_at };
}

export function getCertificateList(): Array<Certificate & { participantName: string; trainingTitle: string; trainingSlug: string; trainingStartsAt: string; trainingEndsAt: string }> {
  const rows = getDatabase().prepare(`
    SELECT c.*, u.name AS participant_name, t.title AS training_title, t.slug AS training_slug, t.starts_at, t.ends_at
    FROM certificates c JOIN users u ON u.id = c.participant_id JOIN trainings t ON t.id = c.training_id
    ORDER BY c.issued_at DESC
  `).all() as Array<CertificateRow & { participant_name: string; training_title: string; training_slug: string; starts_at: string; ends_at: string }>;
  return rows.map((row) => ({ ...mapCertificate(row), participantName: row.participant_name, trainingTitle: row.training_title, trainingSlug: row.training_slug, trainingStartsAt: row.starts_at, trainingEndsAt: row.ends_at }));
}

export function getUpcomingSessions(limit = 5): Array<TrainingSession & { trainingTitle: string; trainingSlug: string }> {
  const rows = getDatabase().prepare(`
    SELECT s.*, t.title AS training_title, t.slug AS training_slug
    FROM training_sessions s JOIN trainings t ON t.id = s.training_id
    WHERE t.status IN ('PUBLISHED','ONGOING') ORDER BY s.session_date ASC, s.start_time ASC LIMIT ?
  `).all(limit) as Array<SessionRow & { training_title: string; training_slug: string }>;
  return rows.map((row) => ({ ...mapSession(row), trainingTitle: row.training_title, trainingSlug: row.training_slug }));
}

export function countRegistrations(trainingId: number, excludeRegistrationId?: number): number {
  const row = excludeRegistrationId
    ? getDatabase().prepare("SELECT COUNT(*) AS count FROM registrations WHERE training_id = ? AND id != ? AND status NOT IN ('REJECTED','CANCELLED')").get(trainingId, excludeRegistrationId) as { count: number }
    : getDatabase().prepare("SELECT COUNT(*) AS count FROM registrations WHERE training_id = ? AND status NOT IN ('REJECTED','CANCELLED')").get(trainingId) as { count: number };
  return row.count;
}

export function createRegistration(trainingId: number, participantId: number): { ok: boolean; message: string } {
  const database = getDatabase();
  const participant = database.prepare("SELECT role FROM users WHERE id = ?").get(participantId) as { role: string } | undefined;
  if (!participant || participant.role !== "PARTICIPANT") return { ok: false, message: "Pendaftaran hanya dapat dilakukan oleh akun peserta." };
  const training = database.prepare("SELECT * FROM trainings WHERE id = ?").get(trainingId) as TrainingRow | undefined;
  if (!training || training.status !== "PUBLISHED" || new Date(training.registration_deadline).getTime() < Date.now()) return { ok: false, message: "Pendaftaran untuk diklat ini sudah ditutup." };
  if (countRegistrations(trainingId) >= training.quota) return { ok: false, message: "Kuota peserta sudah penuh." };
  const existing = database.prepare("SELECT id FROM registrations WHERE training_id = ? AND participant_id = ?").get(trainingId, participantId) as { id: number } | undefined;
  if (existing) return { ok: false, message: "Anda sudah terdaftar pada diklat ini." };
  const status = training.price > 0 ? "PENDING" : "VERIFIED";
  database.prepare("INSERT INTO registrations (training_id, participant_id, status, verified_at) VALUES (?, ?, ?, ?)").run(trainingId, participantId, status, status === "VERIFIED" ? new Date().toISOString() : null);
  return { ok: true, message: status === "VERIFIED" ? "Pendaftaran terkonfirmasi. Silakan lanjutkan ke halaman pelatihan." : "Pendaftaran berhasil. Tunggu verifikasi administrator." };
}

export function updateRegistrationStatus(id: number, status: RegistrationStatus, actorRole: Role): { ok: boolean; message: string } {
  const database = getDatabase();
  const row = database.prepare("SELECT * FROM registrations WHERE id = ?").get(id) as RegistrationRow | undefined;
  if (!row) return { ok: false, message: "Pendaftaran tidak ditemukan." };
  if (actorRole === "VERIFIER" && status !== "VERIFIED" && status !== "REJECTED") return { ok: false, message: "Verifikator hanya dapat memverifikasi atau menolak pendaftaran." };
  if (actorRole === "ADMIN" || actorRole === "SUPER_ADMIN") {
    const allowed: Record<RegistrationStatus, RegistrationStatus[]> = {
      PENDING: ["VERIFIED", "REJECTED", "PAID", "CANCELLED"],
      PAID: ["VERIFIED", "COMPLETED", "REJECTED", "CANCELLED"],
      VERIFIED: ["PAID", "COMPLETED", "REJECTED", "CANCELLED"],
      COMPLETED: ["VERIFIED", "REJECTED", "CANCELLED"],
      REJECTED: ["PENDING", "VERIFIED", "CANCELLED"],
      CANCELLED: ["PENDING", "VERIFIED"],
    };
    if (!allowed[row.status as RegistrationStatus].includes(status)) return { ok: false, message: `Transisi ${row.status} ke ${status} tidak diizinkan.` };
  }
  const transaction = database.transaction(() => {
    database.prepare("UPDATE registrations SET status = ?, verified_at = CASE WHEN ? IN ('VERIFIED','PAID','COMPLETED') THEN COALESCE(verified_at, ?) ELSE verified_at END WHERE id = ?").run(status, status, new Date().toISOString(), id);
    if (status !== "COMPLETED") database.prepare("UPDATE certificates SET revoked_at = COALESCE(revoked_at, ?) WHERE registration_id = ?").run(new Date().toISOString(), id);
  });
  transaction();
  return { ok: true, message: status === "REJECTED" ? "Pendaftaran ditolak." : "Status pendaftaran diperbarui." };
}

export function recordScores(registrationId: number, scores: { postTest: number; task: number }): { ok: boolean; message: string } {
  const database = getDatabase();
  const row = database.prepare(`
    SELECT r.*, t.pass_score, t.attendance_weight, t.task_weight, t.post_test_weight, t.minimum_attendance_jp,
      COALESCE((SELECT SUM(s.jp) FROM training_sessions s WHERE s.training_id = r.training_id), 0) AS total_jp
    FROM registrations r JOIN trainings t ON t.id = r.training_id WHERE r.id = ?
  `).get(registrationId) as (RegistrationRow & { pass_score: number; attendance_weight: number; task_weight: number; post_test_weight: number; minimum_attendance_jp: number; total_jp: number }) | undefined;
  if (!row) return { ok: false, message: "Data peserta tidak ditemukan." };
  if (row.status !== "VERIFIED" && row.status !== "PAID" && row.status !== "COMPLETED") return { ok: false, message: "Peserta harus diverifikasi sebelum dinilai." };
  const boundedPostTest = Math.max(0, Math.min(100, scores.postTest));
  const boundedTask = Math.max(0, Math.min(100, scores.task));
  const finalScore = calculateFinalScore({ attendanceScore: row.attendance_score ?? 0, taskScore: boundedTask, postTestScore: boundedPostTest, attendanceWeight: row.attendance_weight, taskWeight: row.task_weight, postTestWeight: row.post_test_weight });
  const attendanceRequirementMet = row.earned_jp >= row.minimum_attendance_jp;
  const resultStatus = attendanceRequirementMet && finalScore >= row.pass_score ? "PASSED" : "FAILED";
  const transaction = database.transaction(() => {
    database.prepare("UPDATE registrations SET post_test_score = ?, task_score = ?, final_score = ?, result_status = ? WHERE id = ?").run(boundedPostTest, boundedTask, finalScore, resultStatus, registrationId);
    database.prepare("UPDATE certificates SET revoked_at = ? WHERE registration_id = ? AND revoked_at IS NULL").run(new Date().toISOString(), registrationId);
  });
  transaction();
  return { ok: true, message: resultStatus === "PASSED" ? "Nilai tersimpan. Sertifikat siap diterbitkan." : !attendanceRequirementMet ? `JP kehadiran belum mencapai ${row.minimum_attendance_jp} JP.` : "Nilai tersimpan. Peserta belum dinyatakan lulus." };
}

export function recordAttendance(registrationId: number, sessionId: number, status: AttendanceStatus): { ok: boolean; message: string } {
  const database = getDatabase();
  const registration = database.prepare("SELECT * FROM registrations WHERE id = ?").get(registrationId) as RegistrationRow | undefined;
  const session = database.prepare("SELECT * FROM training_sessions WHERE id = ? AND training_id = ?").get(sessionId, registration?.training_id) as SessionRow | undefined;
  if (!registration || !session) return { ok: false, message: "Data absensi tidak ditemukan." };
  if (registration.status !== "VERIFIED" && registration.status !== "PAID" && registration.status !== "COMPLETED") return { ok: false, message: "Peserta harus diverifikasi sebelum absensi dicatat." };
  const transaction = database.transaction(() => {
    database.prepare("INSERT INTO attendance (registration_id, session_id, status) VALUES (?, ?, ?) ON CONFLICT(registration_id, session_id) DO UPDATE SET status = excluded.status, checked_at = CURRENT_TIMESTAMP").run(registrationId, sessionId, status);
    const totalJp = (database.prepare("SELECT COALESCE(SUM(jp), 0) AS value FROM training_sessions WHERE training_id = ?").get(registration.training_id) as { value: number }).value;
    const earnedJp = (database.prepare("SELECT COALESCE(SUM(s.jp * CASE a.status WHEN 'PRESENT' THEN 1 WHEN 'LATE' THEN 0.75 WHEN 'EXCUSED' THEN 0.5 ELSE 0 END), 0) AS value FROM attendance a JOIN training_sessions s ON s.id = a.session_id WHERE a.registration_id = ?").get(registrationId) as { value: number }).value;
    const attendanceScore = totalJp > 0 ? Math.round((earnedJp / totalJp) * 100) : 0;
    const taskScore = registration.task_score;
    const postTestScore = registration.post_test_score;
    if (taskScore !== null && postTestScore !== null) {
      const training = database.prepare("SELECT pass_score, attendance_weight, task_weight, post_test_weight, minimum_attendance_jp FROM trainings WHERE id = ?").get(registration.training_id) as { pass_score: number; attendance_weight: number; task_weight: number; post_test_weight: number; minimum_attendance_jp: number };
      const finalScore = calculateFinalScore({ attendanceScore, taskScore, postTestScore, attendanceWeight: training.attendance_weight, taskWeight: training.task_weight, postTestWeight: training.post_test_weight });
      const resultStatus = Math.round(earnedJp) >= training.minimum_attendance_jp && finalScore >= training.pass_score ? "PASSED" : "FAILED";
      database.prepare("UPDATE registrations SET earned_jp = ?, attendance_score = ?, final_score = ?, result_status = ? WHERE id = ?").run(Math.round(earnedJp), attendanceScore, finalScore, resultStatus, registrationId);
    } else {
      database.prepare("UPDATE registrations SET earned_jp = ?, attendance_score = ? WHERE id = ?").run(Math.round(earnedJp), attendanceScore, registrationId);
    }
    database.prepare("UPDATE certificates SET revoked_at = ? WHERE registration_id = ? AND revoked_at IS NULL").run(new Date().toISOString(), registrationId);
  });
  transaction();
  return { ok: true, message: "Absensi tersimpan." };
}

export function issueCertificate(registrationId: number): { ok: boolean; message: string; id?: number } {
  const database = getDatabase();
  const transaction = database.transaction(() => {
    const row = database.prepare(`
      SELECT r.*, t.title, t.starts_at, t.ends_at, t.minimum_attendance_jp, u.name AS participant_name
      FROM registrations r JOIN trainings t ON t.id = r.training_id JOIN users u ON u.id = r.participant_id
      WHERE r.id = ? AND r.result_status = 'PASSED' AND r.status = 'COMPLETED'
    `).get(registrationId) as (RegistrationRow & { title: string; starts_at: string; ends_at: string; minimum_attendance_jp: number; participant_name: string }) | undefined;
    if (!row) return { ok: false, message: "Sertifikat hanya dapat diterbitkan untuk peserta yang sudah lulus dan selesai." };
    if (row.earned_jp < row.minimum_attendance_jp) return { ok: false, message: `JP kehadiran belum mencapai ${row.minimum_attendance_jp} JP.` };
    const existing = database.prepare("SELECT id FROM certificates WHERE registration_id = ?").get(registrationId) as { id: number } | undefined;
    if (existing) return { ok: true, message: "Sertifikat sudah pernah diterbitkan.", id: existing.id };
    const year = String(new Date().getUTCFullYear());
    database.prepare("INSERT INTO certificate_sequences (year, last_number) VALUES (?, 0) ON CONFLICT(year) DO NOTHING").run(year);
    database.prepare("UPDATE certificate_sequences SET last_number = last_number + 1 WHERE year = ?").run(year);
    const sequence = database.prepare("SELECT last_number FROM certificate_sequences WHERE year = ?").get(year) as { last_number: number };
    const number = `CERT-${year}-${String(sequence.last_number).padStart(4, "0")}`;
    const code = `NK-${randomBytes(12).toString("base64url")}`;
    const result = database.prepare(`
      INSERT INTO certificates (certificate_number, training_id, registration_id, participant_id, total_jp, earned_jp, final_score, verification_code)
      SELECT ?, t.id, r.id, r.participant_id, COALESCE((SELECT SUM(s.jp) FROM training_sessions s WHERE s.training_id = t.id), 0), r.earned_jp, r.final_score, ?
      FROM trainings t, registrations r WHERE t.id = r.training_id AND r.id = ?
    `).run(number, code, registrationId);
    return { ok: true, message: "Sertifikat berhasil diterbitkan.", id: Number(result.lastInsertRowid) };
  });
  return transaction.immediate();
}

export function createTraining(input: { title: string; slug: string; subtitle: string; description: string; objectives: string; category: string; method: Training["method"]; platform: Training["platform"]; location: string | null; price: number; quota: number; startsAt: string; endsAt: string; registrationDeadline: string; facilitator: string; passScore: number; minimumAttendanceJp: number; certificateLabel: string; posterTone: string }): { ok: boolean; message: string; id?: number } {
  const database = getDatabase();
  const existing = database.prepare("SELECT id FROM trainings WHERE slug = ?").get(input.slug) as { id: number } | undefined;
  if (existing) return { ok: false, message: "Slug diklat sudah digunakan." };
  const result = database.prepare(`
    INSERT INTO trainings (slug, title, subtitle, description, objectives, category, method, platform, location, poster_url, price, quota, status, pass_score, attendance_weight, task_weight, post_test_weight, starts_at, ends_at, registration_deadline, minimum_attendance_jp, certificate_label, facilitator)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, 30, 30, 40, ?, ?, ?, ?, ?, ?)
  `).run(input.slug, input.title, input.subtitle, input.description, input.objectives, input.category, input.method, input.platform, input.location, `/api/posters/${input.slug}?tone=${encodeURIComponent(input.posterTone)}`, input.price, input.quota, input.passScore, input.startsAt, input.endsAt, input.registrationDeadline, input.minimumAttendanceJp, input.certificateLabel, input.facilitator);
  return { ok: true, message: "Diklat berhasil dibuat sebagai draft.", id: Number(result.lastInsertRowid) };
}

export function listUsersByRole(role?: Role): Array<User & { institution: string; phone: string }> {
  const rows = role
    ? getDatabase().prepare(`SELECT ${userSelect} FROM users WHERE role = ? ORDER BY name`).all(role)
    : getDatabase().prepare(`SELECT ${userSelect} FROM users ORDER BY name`).all();
  return rows as Array<User & { institution: string; phone: string }>;
}

export function updateUserPassword(userId: number, password: string): boolean {
  return getDatabase().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), userId).changes > 0;
}
