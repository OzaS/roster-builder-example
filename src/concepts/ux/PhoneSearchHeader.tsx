import { useId, useRef, useState, type ReactNode } from 'react';
import { Eraser, Search, X } from 'lucide-react';
import './phone-lists.css';

/** Phone list-page search replaces the title and avatar without moving the filters or losing the query. */
export function PhoneSearchHeader({ title, subtitle, query, onQueryChange, placeholder, trailing, initialOpen = false, searchable = true }: {
  title: string; subtitle?: string; query: string; onQueryChange: (query: string) => void;
  placeholder: string; trailing?: ReactNode; initialOpen?: boolean; searchable?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const close = () => { setOpen(false); requestAnimationFrame(() => toggleRef.current?.focus()); };
  return <header className={`ux-wb-top ux-wb-home-top ux-phone-search-header ${open ? 'search-open' : ''}`}>
    {open ? <div className="ux-phone-search-field" id={id} role="search">
      <Search size={19} aria-hidden />
      <input ref={inputRef} type="search" autoFocus value={query} aria-label={placeholder} placeholder={placeholder}
        onChange={event => onQueryChange(event.currentTarget.value)} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close(); } }} />
      {query && <button type="button" aria-label="Clear search" title="Clear search" onClick={() => { onQueryChange(''); inputRef.current?.focus(); }}><Eraser size={18} aria-hidden /></button>}
      <button type="button" className="ux-phone-search-close" aria-label="Close search" title="Close search" onClick={close}><X size={20} aria-hidden /></button>
    </div> : <>
      <div className="ux-wb-title"><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</div>
      {searchable && <button ref={toggleRef} type="button" className={`ux-icon-btn ux-phone-search-toggle ${query ? 'active' : ''}`}
        aria-label={`Search ${title.toLowerCase()}${query ? `, current search: ${query}` : ''}`} aria-expanded={false} aria-controls={id}
        onClick={() => setOpen(true)}><Search size={21} aria-hidden /></button>}
      {trailing}
    </>}
  </header>;
}
