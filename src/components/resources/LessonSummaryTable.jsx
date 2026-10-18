// Aide-mémoire : le plan entier sur une seule page, à relire avant chaque compte lancé.
export default function LessonSummaryTable({ title, head, rows }) {
  return (
    <section className="mb-12">
      <h3 className="font-heading text-xl font-semibold tracking-tight">{title}</h3>
      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-secondary">
            <tr>
              {head.map((cell) => (
                <th key={cell} className="px-4 py-3 font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([day, what]) => (
              <tr key={day} className="border-t border-border bg-card">
                <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-foreground">{day}</td>
                <td className="px-4 py-3 leading-relaxed text-muted-foreground">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}