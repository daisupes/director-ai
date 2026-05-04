export function SectionTitle({ eyebrow, title, description }) {
  return (
    <div>
      {eyebrow ? (
        <p className="mb-3 text-[11px] uppercase tracking-[0.26em] text-violet-200/55">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-[-0.04em] text-white md:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-300/75">
          {description}
        </p>
      ) : null}
    </div>
  );
}
