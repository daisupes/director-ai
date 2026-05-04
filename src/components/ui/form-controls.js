import { cn } from "@/lib/utils";

export function Label({ children }) {
  return (
    <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-neutral-500">
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-violet-400/45 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]",
        className
      )}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-violet-400/45 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]",
        className
      )}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-400/45 focus:bg-black/45 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]",
        className
      )}
    >
      {children}
    </select>
  );
}
