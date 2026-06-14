export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6 animate-fade-in-up">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
