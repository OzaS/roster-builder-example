import type { ReactNode } from 'react';

/** Page commands stay separate from content actions; platform styling comes from the tablet shell. */
export function TabletToolbar({ title, search, children }: { title: string; search?: ReactNode; children?: ReactNode }) {
  return <header className="tb-platform-toolbar">
    <h1>{title}</h1>
    {search}
    {children && <div className="tb-toolbar-actions" role="group" aria-label={`${title} actions`}>{children}</div>}
  </header>;
}
