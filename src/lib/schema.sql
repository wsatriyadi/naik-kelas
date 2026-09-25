PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  institution TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN','ADMIN','FACILITATOR','VERIFIER','LEADER','PARTICIPANT')),
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  objectives TEXT NOT NULL,
  category TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('ONLINE','OFFLINE','HYBRID')),
  platform TEXT NOT NULL DEFAULT 'ZOOM',
  location TEXT,
  poster_url TEXT,
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  quota INTEGER NOT NULL CHECK (quota > 0),
  status TEXT NOT NULL CHECK (status IN ('DRAFT','PUBLISHED','ONGOING','COMPLETED','ARCHIVED')),
  pass_score INTEGER NOT NULL DEFAULT 70 CHECK (pass_score BETWEEN 0 AND 100),
  attendance_weight INTEGER NOT NULL DEFAULT 30,
  task_weight INTEGER NOT NULL DEFAULT 30,
  post_test_weight INTEGER NOT NULL DEFAULT 40,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  registration_deadline TEXT NOT NULL,
  minimum_attendance_jp INTEGER NOT NULL DEFAULT 0 CHECK (minimum_attendance_jp >= 0),
  certificate_label TEXT NOT NULL DEFAULT 'SERTIFIKAT PELATIHAN',
  facilitator TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  session_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  platform TEXT NOT NULL,
  meeting_url TEXT,
  meeting_id TEXT,
  passcode TEXT,
  recording_url TEXT,
  jp INTEGER NOT NULL CHECK (jp > 0),
  notes TEXT,
  attendance_open INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS training_facilitators (
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  facilitator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (training_id, facilitator_id)
);

CREATE TABLE IF NOT EXISTS certificate_sequences (
  year TEXT PRIMARY KEY,
  last_number INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_id INTEGER NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PENDING','VERIFIED','REJECTED','PAID','COMPLETED','CANCELLED')),
  pre_test_score REAL,
  post_test_score REAL,
  task_score REAL,
  attendance_score REAL,
  final_score REAL,
  result_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (result_status IN ('PENDING','PASSED','FAILED')),
  earned_jp INTEGER NOT NULL DEFAULT 0,
  registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TEXT,
  UNIQUE (training_id, participant_id)
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  registration_id INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  session_id INTEGER NOT NULL REFERENCES training_sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('PRESENT','LATE','EXCUSED','ABSENT')),
  notes TEXT,
  checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (registration_id, session_id)
);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificate_number TEXT NOT NULL UNIQUE,
  training_id INTEGER NOT NULL REFERENCES trainings(id),
  registration_id INTEGER NOT NULL UNIQUE REFERENCES registrations(id),
  participant_id INTEGER NOT NULL REFERENCES users(id),
  issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  total_jp INTEGER NOT NULL CHECK (total_jp >= 0),
  earned_jp INTEGER NOT NULL CHECK (earned_jp >= 0),
  final_score REAL,
  verification_code TEXT NOT NULL UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_trainings_status ON trainings(status);
CREATE INDEX IF NOT EXISTS idx_trainings_deadline ON trainings(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_sessions_training ON training_sessions(training_id, session_date);
CREATE INDEX IF NOT EXISTS idx_registrations_training ON registrations(training_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_participant ON registrations(participant_id, status);
CREATE INDEX IF NOT EXISTS idx_attendance_registration ON attendance(registration_id);
CREATE INDEX IF NOT EXISTS idx_certificates_participant ON certificates(participant_id);
