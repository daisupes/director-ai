export function EmptyOutputCard({ title, description, icon: Icon }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-violet-100">
          <Icon size={16} />
        </div>
        <p className="text-base font-semibold text-white">{title}</p>
      </div>
      <p className="mt-4 text-sm leading-7 text-neutral-400">{description}</p>
    </div>
  );
}
