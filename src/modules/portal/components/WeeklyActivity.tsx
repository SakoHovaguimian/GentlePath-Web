export function WeeklyActivity({
  values,
  title,
  hint,
}: {
  values: number[];
  title: string;
  hint: string;
}) {
  const maximum = Math.max(...values, 1);
  return (
    <figure className="m-0 grid gap-5">
      <figcaption>
        <h2 className="m-0 font-display text-xl text-primary">{title}</h2>
        <p className="mt-2 text-sm text-secondary">{hint}</p>
      </figcaption>
      <div className="grid h-36 grid-cols-7 items-end gap-3">
        {values.map((value, index) => {
          const date = new Date();
          date.setDate(date.getDate() - 6 + index);
          return (
            <div
              key={index}
              className="flex h-full flex-col items-center justify-end gap-2"
            >
              <span className="text-xs text-secondary tabular-nums">
                {value}
              </span>
              <div
                className="gp-weekly-activity__bar w-full max-w-10 rounded-t-lg bg-brand-solid/65"
                style={{ height: `${Math.max(4, (value / maximum) * 72)}%` }}
              />
              <span className="text-xs text-tertiary">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
