import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getDatabase } from "@/lib/db";
import { createRegistration, getTrainingBySlug, issueCertificate, listRegistrations, recordAttendance, recordScores, updateRegistrationStatus } from "@/lib/repository";

const testDatabasePath = path.join(process.cwd(), "data", "test-diklat.sqlite");

describe("repository diklat", () => {
  beforeEach(() => {
    for (const suffix of ["", "-wal", "-shm"]) {
      const file = `${testDatabasePath}${suffix}`;
      if (fs.existsSync(file)) fs.rmSync(file);
    }
    process.env.DATABASE_PATH = "data/test-diklat.sqlite";
    process.env.SEED_DEMO_DATA = "true";
    const database = getDatabase();
    const trainingId = (database.prepare("SELECT id FROM trainings WHERE slug = ?").get("manajemen-data-cerdas") as { id: number }).id;
    database.prepare("DELETE FROM registrations WHERE training_id = ? AND participant_id = 6").run(trainingId);
  });

  it("menjalankan alur daftar,JP, nilai, dan sertifikat", () => {
    const training = getTrainingBySlug("manajemen-data-cerdas");
    expect(training).not.toBeNull();
    const registration = createRegistration(training!.id, 6);
    expect(registration.ok).toBe(true);
    const item = listRegistrations({ trainingId: training!.id, participantId: 6 })[0];
    expect(item.status).toBe("VERIFIED");
    for (const session of training!.sessions) {
      expect(recordAttendance(item.id, session.id, "PRESENT").ok).toBe(true);
    }
    expect(recordScores(item.id, { task: 90, postTest: 95 }).ok).toBe(true);
    expect(updateRegistrationStatus(item.id, "COMPLETED", "ADMIN").ok).toBe(true);
    const issued = issueCertificate(item.id);
    expect(issued.ok).toBe(true);
    expect(issued.id).toBeGreaterThan(0);
    const updated = listRegistrations({ trainingId: training!.id, participantId: 6 })[0];
    expect(updated.earned_jp).toBe(32);
    expect(updated.final_score).toBeGreaterThanOrEqual(training!.passScore);
  });
});
