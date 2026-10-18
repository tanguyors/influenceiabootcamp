// Sommaire d'une leçon : on saute directement au chapitre ou à la journée voulue.
// Il accompagne la lecture sur grand écran et reste discret sur mobile.
export default function LessonOutline({ title, chapters }) {
  return (
    <nav className="hidden lg:sticky lg:top-10 lg:block lg:self-start">
      <p className="font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="mt-4 border-l border-border">
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              className="-ml-px flex items-baseline gap-2.5 border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              <span className="font-mono text-[11px] text-muted-foreground/60">{String(index + 1).padStart(2, "0")}</span>
              <span>{chapter.label}</span>
            </a>
            {chapter.children && (
              <ul className="mb-2 mt-0.5 space-y-1">
                {chapter.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      className="-ml-px block border-l-2 border-transparent py-1 pl-11 text-xs text-muted-foreground/80 transition-colors hover:border-primary/60 hover:text-foreground"
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}