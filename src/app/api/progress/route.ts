import { NextResponse } from "next/server";
import { PROBLEM_BY_ID } from "@/data/problems";
import {
  completeQuest,
  recordResource,
  recordReview,
  recordSolve,
  recordStudy,
} from "@/lib/game";
import type { PatternId } from "@/data/types";
import { readProgress, writeProgress } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(readProgress());
}

type Body =
  | { action: "solve"; problemId: string; hintsUsed?: number; peekedSolution?: boolean; localPass?: boolean }
  | { action: "study"; patternId: PatternId }
  | { action: "resource"; resourceId: string }
  | { action: "quest"; questId: string }
  | { action: "review" };

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  let progress = readProgress();
  let extra: Record<string, unknown> = {};

  if (body.action === "solve") {
    const problem = PROBLEM_BY_ID[body.problemId];
    if (!problem) return NextResponse.json({ error: "unknown problem" }, { status: 404 });
    const result = recordSolve(progress, problem, {
      hintsUsed: body.hintsUsed ?? 0,
      peekedSolution: Boolean(body.peekedSolution),
      localPass: Boolean(body.localPass),
    });
    progress = result.progress;
    extra = { xpEarned: result.xpEarned, firstSolve: result.firstSolve, newly: result.newly };
  } else if (body.action === "study") {
    progress = recordStudy(progress, body.patternId);
  } else if (body.action === "resource") {
    progress = recordResource(progress, body.resourceId);
  } else if (body.action === "quest") {
    progress = completeQuest(progress, body.questId);
  } else if (body.action === "review") {
    progress = recordReview(progress);
  } else {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  writeProgress(progress);
  return NextResponse.json({ progress, ...extra });
}
