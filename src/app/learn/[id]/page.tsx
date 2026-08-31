import { PATTERNS } from "@/data/types";
import { PatternView } from "./view";

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export default function PatternPage({ params }: { params: { id: string } }) {
  return <PatternView id={params.id} />;
}
