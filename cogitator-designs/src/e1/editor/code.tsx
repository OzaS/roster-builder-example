import { FileCode2 } from "lucide-react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DiagIcon } from "../../glyphs";
import type { DiagKind } from "../../sample";
import { charClasses, type SynClass } from "./syntax";

/**
 * The source text editor (a new primitive): line numbers, a diagnostics gutter, DKLPO syntax colours from the tokens
 * (`--cg-syntax-*`), status underlines (error wavy, preservation dashed, suggestion dotted: shape as well as colour),
 * a selected line range (synced with the page), the caret, and popovers anchored at a column (hover card, quick-fix menu).
 */

export type CodeMark = { id: string; line: number; from: number; to: number; kind: DiagKind };
export type CodeCaret = { line: number; col: number };
export type CodePop = { line: number; col: number; node: ReactNode; above?: boolean };

const rank: Record<DiagKind, number> = { error: 0, preservation: 1, suggestion: 2 };

function Line({ text, marks, caret, pop, onHover }: { text: string; marks: CodeMark[]; caret?: number; pop?: CodePop; onHover?: (id: string | null) => void }) {
  const classes = charClasses(text);
  const markAt = (i: number) => marks.filter((m) => i >= m.from && i < m.to).sort((a, b) => rank[a.kind] - rank[b.kind])[0];
  const runs: { text: string; c: SynClass; mark?: CodeMark; start: number }[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const c = classes[i] ?? "";
    const mark = markAt(i);
    const last = runs[runs.length - 1];
    const cut = i === caret || i === pop?.col;
    if (last && last.c === c && last.mark === mark && !cut) last.text += text[i];
    else runs.push({ text: text[i], c, mark, start: i });
  }
  const anchor = (at: number) => (
    <>
      {caret === at ? <span className="cg-caret" aria-hidden /> : null}
      {pop && pop.col === at ? <span className={`cg-code-anchor${pop.above ? " above" : ""}`}>{pop.node}</span> : null}
    </>
  );
  return (
    <>
      {runs.map((run) => (
        <span key={run.start} style={{ display: "contents" }}>
          {anchor(run.start)}
          <span className={`${run.c ? `syn-${run.c}` : ""}${run.mark ? ` cg-u ${run.mark.kind}` : ""}`}
            onMouseEnter={run.mark && onHover ? () => onHover(run.mark!.id) : undefined}>{run.text}</span>
        </span>
      ))}
      {caret !== undefined && caret >= text.length ? anchor(caret) : pop && pop.col >= text.length ? anchor(pop.col) : null}
    </>
  );
}

export function CodeView({ lines, marks = [], selected, caret, pop, inline, onLine, onHover, scrollTo, start = 1, end, label, compact, wrapClass = "" }: {
  lines: string[]; marks?: CodeMark[]; selected?: [number, number] | null; caret?: CodeCaret | null; pop?: CodePop | null;
  inline?: Record<number, ReactNode>; onLine?: (line: number) => void; onHover?: (id: string | null) => void;
  /** Line to keep in view (scrolled to on mount and when it changes; placed a few lines below the top). */
  scrollTo?: number; start?: number; end?: number; label: string; compact?: boolean; wrapClass?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || !scrollTo) return;
    const row = el.querySelector<HTMLElement>(`[data-line="${scrollTo}"]`);
    if (!row) return;
    const top = row.offsetTop - row.offsetHeight * 3;
    if (row.offsetTop < el.scrollTop || row.offsetTop + row.offsetHeight > el.scrollTop + el.clientHeight) el.scrollTop = Math.max(0, top);
  }, [scrollTo]);
  const last = end ?? lines.length;
  const gutterKind = (n: number) => marks.filter((m) => m.line === n).sort((a, b) => rank[a.kind] - rank[b.kind])[0]?.kind;
  const rows: ReactNode[] = [];
  for (let n = start; n <= last; n += 1) {
    const text = lines[n - 1] ?? "";
    const isSel = Boolean(selected && n >= selected[0] && n <= selected[1]);
    const kind = gutterKind(n);
    rows.push(
      <div key={n} data-line={n} className={`cg-code-line${isSel ? " sel" : ""}${isSel && selected && n === selected[0] ? " sel-first" : ""}${isSel && selected && n === selected[1] ? " sel-last" : ""}${caret?.line === n ? " caret-line" : ""}`}
        onClick={onLine ? () => onLine(n) : undefined}>
        <span className="cg-code-gut" aria-hidden>{kind ? <DiagIcon kind={kind} size={12} /> : null}</span>
        <span className="cg-code-num" aria-hidden>{n}</span>
        <span className="cg-code-text"><Line text={text} marks={marks.filter((m) => m.line === n)} caret={caret?.line === n ? caret.col : undefined} pop={pop?.line === n ? pop : undefined} onHover={onHover} />{text ? null : "​"}</span>
      </div>,
    );
    if (inline?.[n]) rows.push(<div key={`i${n}`} className="cg-code-inline">{inline[n]}</div>);
  }
  return (
    <div className={`cg-code${compact ? " compact" : ""} ${wrapClass}`} role="textbox" aria-multiline aria-label={label} tabIndex={0} onMouseLeave={onHover ? () => onHover(null) : undefined}>
      <div className="cg-code-scroll" ref={scroller}>{rows}</div>
    </div>
  );
}

/** The text pane's header: the file, which entry the selection is in, and the pane's view buttons. */
export function CodeHead({ path, where, children }: { path: string; where?: ReactNode; children?: ReactNode }) {
  return (
    <header className="cg-code-head">
      <FileCode2 size={14} /><span className="mono">{path}</span>{where ? <span className="d-muted">{where}</span> : null}
      <span className="d-spacer" />
      {children}
    </header>
  );
}

/** The status line under the text: caret position, whether `fmt` would change anything, encoding, line ends. */
export function CodeStatus({ caret, fmt, counts, children }: { caret?: CodeCaret | null; fmt: "clean" | "changes" | "blocked"; counts?: Partial<Record<DiagKind, number>>; children?: ReactNode }) {
  return (
    <footer className="cg-code-status">
      {counts ? (["error", "preservation", "suggestion"] as DiagKind[]).filter((k) => counts[k]).map((k) => <span key={k} className="cg-code-count"><DiagIcon kind={k} size={12} />{counts[k]}</span>) : null}
      {children}
      <span className="d-spacer" />
      {caret ? <span>Ln {caret.line}, Col {caret.col + 1}</span> : null}
      <span className={`cg-fmt ${fmt}`} title={fmt === "clean" ? "fmt would change nothing" : fmt === "changes" ? "fmt would reformat this file (⌥⇧F)" : "fmt runs only on text that parses"}>{fmt === "clean" ? "fmt clean" : fmt === "changes" ? "fmt: 2 changes" : "fmt waits for a parse"}</span>
      <span>UTF-8</span><span>LF</span><span>Spaces: 2</span><span>DKLPO 1.0</span>
    </footer>
  );
}
