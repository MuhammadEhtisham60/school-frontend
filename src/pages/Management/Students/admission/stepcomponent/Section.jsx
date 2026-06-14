export function Section({ title, desc, children }) {
  return (
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{desc}</p>
      <div className="grid md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}
