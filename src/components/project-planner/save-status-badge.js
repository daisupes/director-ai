import { Save } from "lucide-react";
import { formatTime } from "@/lib/project-planner";

export function SaveStatusBadge({ isSaved, lastSavedAt }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-neutral-300">
      <Save size={12} className={isSaved ? "text-emerald-300" : "text-neutral-400"} />
      {isSaved ? `Saved ${formatTime(lastSavedAt)}` : "Saving..."}
    </div>
  );
}
