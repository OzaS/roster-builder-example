export type LibraryId = "phone" | "tablet" | "desktop";

/** Gallery chrome: one link per design library (separate designs and independent view preferences, DEC-039). */
export function LibrarySwitch({ current, label = "Design libraries" }: { current?: LibraryId; label?: string }) {
  const items: Array<{ id: LibraryId; label: string; href: string }> = [
    { id: "phone", label: "Phone", href: "./" },
    { id: "tablet", label: "Tablet", href: "?gallery=tablet" },
    { id: "desktop", label: "Desktop", href: "?gallery=desktop" },
  ];
  return (
    <nav className="design-library-switch" aria-label={label}>
      {items.map((item) => <a key={item.id} href={item.href} aria-current={current === item.id ? "page" : undefined}>{item.label}</a>)}
    </nav>
  );
}
