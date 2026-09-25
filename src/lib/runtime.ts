export function shouldSeedDemoData(): boolean {
  return process.env.SEED_DEMO_DATA === "true" && process.env.NODE_ENV !== "production";
}
