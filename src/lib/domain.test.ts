import { describe, expect, it } from "vitest";
import { calculateFinalScore, gradeFromScore, isTrainingOpen } from "@/lib/domain";

describe("calculateFinalScore", () => {
  it("menghitung nilai akhir dari bobot program", () => {
    expect(calculateFinalScore({ attendanceScore: 100, taskScore: 80, postTestScore: 90, attendanceWeight: 30, taskWeight: 30, postTestWeight: 40 })).toBe(90);
  });
  it("menghormati bobot nol", () => {
    expect(calculateFinalScore({ attendanceScore: 100, taskScore: 0, postTestScore: 75, attendanceWeight: 0, taskWeight: 0, postTestWeight: 100 })).toBe(75);
  });
});

describe("isTrainingOpen", () => {
  const future = new Date(Date.now() + 86_400_000).toISOString();
  it("membuka program yang published dan belum melewati deadline", () => {
    expect(isTrainingOpen({ status: "PUBLISHED", quota: 10, registrationDeadline: future })).toBe(true);
  });
  it("menutup program draft, penuh, atau kedaluwarsa", () => {
    expect(isTrainingOpen({ status: "DRAFT", quota: 10, registrationDeadline: future })).toBe(false);
    expect(isTrainingOpen({ status: "PUBLISHED", quota: 0, registrationDeadline: future })).toBe(false);
    expect(isTrainingOpen({ status: "PUBLISHED", quota: 10, registrationDeadline: new Date(Date.now() - 86_400_000).toISOString() })).toBe(false);
  });
});

describe("gradeFromScore", () => {
  it("memetakan nilai ke predikat", () => {
    expect(gradeFromScore(90)).toBe("A");
    expect(gradeFromScore(80)).toBe("B");
    expect(gradeFromScore(70)).toBe("C");
    expect(gradeFromScore(69)).toBe("D");
  });
});
