import { cn } from "@/lib/utils";

export function GuidedFieldGroup({ title, description, className = "", children }) {
  return (
    <div className={cn("director-user-input rounded-[24px] border p-4 md:p-5", className)}>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="mt-1 text-sm leading-6 text-neutral-400">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function FieldHint({ children, example }) {
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs leading-5 text-neutral-500">{children}</p>
      {example ? (
        <p className="rounded-xl border border-violet-200/10 bg-violet-300/[0.055] px-3 py-2 text-xs leading-5 text-violet-100/80">
          <span className="font-semibold text-violet-50">Example:</span>{" "}
          {example}
        </p>
      ) : null}
    </div>
  );
}
