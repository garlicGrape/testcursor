import fs from "node:fs";
import path from "node:path";
import { emptyProgress } from "./game";
import type { Progress } from "@/data/types";

const FILE = path.join(process.cwd(), "data", "progress.json");

export function readProgress(): Progress {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch {
    return emptyProgress();
  }
}

export function writeProgress(progress: Progress): void {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, `${JSON.stringify(progress, null, 2)}\n`);
}
