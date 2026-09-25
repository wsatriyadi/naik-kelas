import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { ensureRuntimeDirectories, getDatabasePath } from "@/lib/paths";
import { shouldSeedDemoData } from "@/lib/runtime";
import { hashPassword } from "@/lib/security";

const globalDatabase = globalThis as unknown as { diklatDatabase?: Database.Database };

function createDatabase(): Database.Database {
  ensureRuntimeDirectories();
  const database = new Database(getDatabasePath());
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.exec(fs.readFileSync(path.join(process.cwd(), "src/lib/schema.sql"), "utf8"));
  const columns = database.prepare("PRAGMA table_info(trainings)").all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === "minimum_attendance_jp")) {
    database.exec("ALTER TABLE trainings ADD COLUMN minimum_attendance_jp INTEGER NOT NULL DEFAULT 0");
  }
  if (!columns.some((column) => column.name === "certificate_label")) {
    database.exec("ALTER TABLE trainings ADD COLUMN certificate_label TEXT NOT NULL DEFAULT 'SERTIFIKAT PELATIHAN'");
  }
  if (shouldSeedDemoData()) seedDatabase(database);
  return database;
}

function seedDatabase(database: Database.Database): void {
  const existingUsers = database.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  if (existingUsers.count > 0) return;

  const now = new Date();
  const iso = (daysFromNow: number, hour = 8) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  const insertUser = database.prepare(`
    INSERT INTO users (name, email, phone, institution, role, password_hash)
    VALUES (@name, @email, @phone, @institution, @role, @passwordHash)
  `);
  const users = [
    ["Rani Prameswari", "admin@diklat.local", "081200000001", "Badan Diklat", "SUPER_ADMIN"],
    ["Bagas Kurniawan", "facilitator@diklat.local", "081200000002", "Pusdiklat", "FACILITATOR"],
    ["Nadia Rahma", "verifikator@diklat.local", "081200000003", "Tim Verifikasi", "VERIFIER"],
    ["Siti Aminah", "peserta@diklat.local", "081200000004", "Dinas Pendidikan", "PARTICIPANT"],
    ["Andi Wijaya", "andi.wijaya@example.com", "081200000005", "Dinas Kearsipan", "PARTICIPANT"],
    ["Maya Lestari", "maya.lestari@example.com", "081200000006", "Badan Kearsipan", "PARTICIPANT"],
  ] as const;
  const passwordHash = hashPassword("Demo123!");
  for (const [name, email, phone, institution, role] of users) {
    insertUser.run({ name, email, phone, institution, role, passwordHash });
  }

  const insertTraining = database.prepare(`
    INSERT INTO trainings (
      slug, title, subtitle, description, objectives, category, method, platform,
      location, poster_url, price, quota, status, pass_score, attendance_weight,
      task_weight, post_test_weight, starts_at, ends_at, registration_deadline,
      minimum_attendance_jp, certificate_label, facilitator
    ) VALUES (
      @slug, @title, @subtitle, @description, @objectives, @category, @method, @platform,
      @location, @posterUrl, @price, @quota, @status, @passScore, @attendanceWeight,
      @taskWeight, @postTestWeight, @startsAt, @endsAt, @registrationDeadline,
      @minimumAttendanceJp, @certificateLabel, @facilitator
    )
  `);
  const trainingOne = insertTraining.run({
    slug: "manajemen-data-cerdas",
    title: "Manajemen Data Cerdas",
    subtitle: "Ubah data menjadi keputusan yang dapat dipertanggungjawabkan",
    description: "Kelas praktik untuk membangun kebiasaan pengumpulan data yang rapi, analisis yang dapat dipertanggungjawabkan, dan visualisasi yang membantu pengambilan keputusan. Peserta langsung mengeja dan mempresentasikan satu kasus kerja.",
    objectives: "Merancang skema data sederhana\nMenyusun indikator yang terukur\nMenelaah angka secara kritis\nMembuat visualisasi yang persuasif",
    category: "Kompetensi Digital",
    method: "ONLINE",
    platform: "ZOOM",
    location: null,
    posterUrl: "/api/posters/manajemen-data-cerdas",
    price: 0,
    quota: 40,
    status: "PUBLISHED",
    passScore: 70,
    attendanceWeight: 30,
    taskWeight: 30,
    postTestWeight: 40,
    startsAt: iso(14, 8),
    endsAt: iso(15, 16),
    registrationDeadline: iso(10, 23),
    minimumAttendanceJp: 24,
    certificateLabel: "SERTIFIKAT PELATIHAN",
    facilitator: "Rani Prameswari · Pemangku Data",
  });
  const trainingTwo = insertTraining.run({
    slug: "komunikasi-pemimpin",
    title: "Komunikasi untuk Pemimpin",
    subtitle: "Bangun kehadiran, ketelitian, dan keputusan yang lebih baik",
    description: "Program singkat untuk pemimpin yang ingin membangun narasi yang jernih, memahami kebutuhan tim, dan mengelola percakapan sulit secara bertanggung jawab.",
    objectives: "Menyusun narasi yang relevan\nMemberikan umpan balik yang aman\nMengelola percakapan sulit",
    category: "Kepemimpinan",
    method: "ONLINE",
    platform: "GOOGLE_MEET",
    location: null,
    posterUrl: "/api/posters/komunikasi-pemimpin",
    price: 250000,
    quota: 24,
    status: "PUBLISHED",
    passScore: 70,
    attendanceWeight: 30,
    taskWeight: 30,
    postTestWeight: 40,
    startsAt: iso(28, 8),
    endsAt: iso(28, 16),
    registrationDeadline: iso(24, 23),
    minimumAttendanceJp: 6,
    certificateLabel: "SERTIFIKAT PEMIMPIN",
    facilitator: "Bagas Kurniawan · Coach Komunikasi",
  });
  const trainingThree = insertTraining.run({
    slug: "kearsipan-digital",
    title: "Kearsipan Digital",
    subtitle: "Dokumen yang aman, mudah ditemukan, dan siap diaudit",
    description: "Latihan terstruktur untuk merapikan arsip fisik dan digital dengan penamaan, retensi, serta jalur pemulihan yang jelas.",
    objectives: "Menyusun klasifikasi arsip\nMenentukan aturan retensi\nMenyiapkan cadangan data",
    category: "Administrasi",
    method: "ONLINE",
    platform: "MICROSOFT_TEAMS",
    location: null,
    posterUrl: "/api/posters/kearsipan-digital",
    price: 0,
    quota: 60,
    status: "COMPLETED",
    passScore: 70,
    attendanceWeight: 30,
    taskWeight: 30,
    postTestWeight: 40,
    startsAt: iso(-28, 8),
    endsAt: iso(-27, 16),
    registrationDeadline: iso(-34, 23),
    minimumAttendanceJp: 12,
    certificateLabel: "SERTIFIKAT PELATIHAN",
    facilitator: "Maya Lestari · Arsiparis",
  });

  const insertSession = database.prepare(`
    INSERT INTO training_sessions (
      training_id, title, session_date, start_time, end_time, platform, meeting_url,
      meeting_id, passcode, recording_url, jp, notes, attendance_open
    ) VALUES (
      @trainingId, @title, @sessionDate, @startTime, @endTime, @platform, @meetingUrl,
      @meetingId, @passcode, @recordingUrl, @jp, @notes, 1
    )
  `);
  const sessionsForOne = [
    [iso(14, 8), "08:00", "12:00", 8, "Peta data dan kualitas data"],
    [iso(14, 13), "13:00", "17:00", 8, "Indikator dan analisis dasar"],
    [iso(15, 8), "08:00", "12:00", 8, "Visualisasi dan presentasi temuan"],
    [iso(15, 13), "13:00", "17:00", 8, "Studi kasus dan umpan balik"],
  ];
  for (const [sessionDate, startTime, endTime, jp, title] of sessionsForOne) {
    insertSession.run({
      trainingId: Number(trainingOne.lastInsertRowid),
      title,
      sessionDate,
      startTime,
      endTime,
      platform: "ZOOM",
      meetingUrl: "https://zoom.us/j/8726401912",
      meetingId: "872 640 1912",
      passcode: "NAIK2026",
      recordingUrl: null,
      jp,
      notes: "Kamera terbuka saat presentasi.",
    });
  }
  insertSession.run({
    trainingId: Number(trainingTwo.lastInsertRowid),
    title: "Narasi, umpan balik, dan percakapan sulit",
    sessionDate: iso(28, 8),
    startTime: "08:00",
    endTime: "16:00",
    platform: "GOOGLE_MEET",
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    meetingId: "abc-defg-hij",
    passcode: "NAIK",
    recordingUrl: null,
    jp: 8,
    notes: "Undangan dikirim melalui Google Workspace.",
  });
  const trainingThreeId = Number(trainingThree.lastInsertRowid);
  const insertSessionThree = database.prepare(`
    INSERT INTO training_sessions (training_id, title, session_date, start_time, end_time, platform, meeting_url, meeting_id, passcode, recording_url, jp, notes, attendance_open)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);
  const oldStart = new Date(iso(-28, 8));
  const oldEnd = new Date(iso(-27, 16));
  insertSessionThree.run(trainingThreeId, "Arsip yang dapat dipertanggungjawabkan", oldStart.toISOString(), "08:00", "16:00", "MICROSOFT_TEAMS", "https://teams.microsoft.com/l/meetup-join/diklat", "diklat-arsip", "ARSIP", null, 8, null);
  insertSessionThree.run(trainingThreeId, "Praktik klasifikasi dan retensi", oldEnd.toISOString(), "08:00", "16:00", "MICROSOFT_TEAMS", "https://teams.microsoft.com/l/meetup-join/diklat", "diklat-arsip", "ARSIP", null, 8, null);

  const insertRegistration = database.prepare(`
    INSERT INTO registrations (training_id, participant_id, status, pre_test_score, post_test_score, task_score, attendance_score, final_score, result_status, earned_jp, registered_at, verified_at)
    VALUES (@trainingId, @participantId, @status, @preTestScore, @postTestScore, @taskScore, @attendanceScore, @finalScore, @resultStatus, @earnedJp, @registeredAt, @verifiedAt)
  `);
  const trainingOneId = Number(trainingOne.lastInsertRowid);
  const trainingTwoId = Number(trainingTwo.lastInsertRowid);
  const pendingPaid = insertRegistration.run({
    trainingId: trainingTwoId,
    participantId: 4,
    status: "PAID",
    preTestScore: 72,
    postTestScore: null,
    taskScore: null,
    attendanceScore: null,
    finalScore: null,
    resultStatus: "PENDING",
    earnedJp: 0,
    registeredAt: now.toISOString(),
    verifiedAt: now.toISOString(),
  });
  insertRegistration.run({
    trainingId: trainingOneId,
    participantId: 5,
    status: "PENDING",
    preTestScore: null,
    postTestScore: null,
    taskScore: null,
    attendanceScore: null,
    finalScore: null,
    resultStatus: "PENDING",
    earnedJp: 0,
    registeredAt: now.toISOString(),
    verifiedAt: null,
  });
  const completedRegistration = insertRegistration.run({
    trainingId: trainingThreeId,
    participantId: 4,
    status: "COMPLETED",
    preTestScore: 76,
    postTestScore: 92,
    taskScore: 88,
    attendanceScore: 100,
    finalScore: 93,
    resultStatus: "PASSED",
    earnedJp: 16,
    registeredAt: iso(-35, 10),
    verifiedAt: iso(-34, 10),
  });
  const trainingOneRegistration = insertRegistration.run({
    trainingId: trainingOneId,
    participantId: 4,
    status: "COMPLETED",
    preTestScore: 64,
    postTestScore: 84,
    taskScore: 80,
    attendanceScore: 100,
    finalScore: 86,
    resultStatus: "PASSED",
    earnedJp: 32,
    registeredAt: iso(-16, 10),
    verifiedAt: iso(-15, 10),
  });

  const sessionIds = database.prepare("SELECT id, training_id FROM training_sessions ORDER BY id").all() as Array<{ id: number; training_id: number }>;
  const insertAttendance = database.prepare("INSERT INTO attendance (registration_id, session_id, status, notes) VALUES (?, ?, ?, ?)");
  for (const session of sessionIds.filter((item) => item.training_id === trainingOneId)) {
    insertAttendance.run(Number(trainingOneRegistration.lastInsertRowid), session.id, "PRESENT", null);
  }
  for (const session of sessionIds.filter((item) => item.training_id === trainingThreeId)) {
    insertAttendance.run(Number(completedRegistration.lastInsertRowid), session.id, "PRESENT", null);
  }
  const firstTrainingTwoSession = sessionIds.find((item) => item.training_id === trainingTwoId);
  if (firstTrainingTwoSession) {
    insertAttendance.run(Number(pendingPaid.lastInsertRowid), firstTrainingTwoSession.id, "PRESENT", null);
  }

  database.prepare(`
    INSERT INTO certificates (certificate_number, training_id, registration_id, participant_id, total_jp, earned_jp, final_score, verification_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(`CERT-${now.getUTCFullYear()}-0001`, trainingThreeId, completedRegistration.lastInsertRowid, 4, 16, 16, 93, "NK-93-4A1D-2026");
  database.prepare("INSERT INTO certificate_sequences (year, last_number) VALUES (?, 1) ON CONFLICT(year) DO UPDATE SET last_number = excluded.last_number").run(String(now.getUTCFullYear()));
}

export function getDatabase(): Database.Database {
  if (!globalDatabase.diklatDatabase?.open) {
    globalDatabase.diklatDatabase = createDatabase();
  }
  return globalDatabase.diklatDatabase;
}
