import { PROBLEMS } from "@/data/problems";
import { ProblemView } from "./view";

export function generateStaticParams() {
  return PROBLEMS.map((p) => ({ id: p.id }));
}

export default function ProblemPage({ params }: { params: { id: string } }) {
  return <ProblemView id={params.id} />;
}
