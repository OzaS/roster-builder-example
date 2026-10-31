import { useEffect, useState } from 'react';

type Experience = { reducedMotion: boolean; reducedTransparency: boolean };
const storageKey = 'roster-builder.tablet-experience.v1';
const eventName = 'tablet-experience-change';
const defaults: Experience = { reducedMotion: false, reducedTransparency: false };

function readExperience(): Experience {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    return { reducedMotion: value.reducedMotion === true, reducedTransparency: value.reducedTransparency === true };
  } catch { return defaults; }
}

/** Shared by the gallery controls, framed screens, standalone previews and in-app Appearance. */
export function useTabletExperience() {
  const [experience, setExperience] = useState(readExperience);
  useEffect(() => {
    const update = (event: Event) => setExperience((event as CustomEvent<Experience>).detail ?? readExperience());
    const storage = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) setExperience(readExperience()); };
    window.addEventListener(eventName, update);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener(eventName, update); window.removeEventListener('storage', storage); };
  }, []);
  const choose = (key: keyof Experience, value: boolean) => {
    const next = { ...experience, [key]: value };
    setExperience(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* The preview also works with storage disabled. */ }
    window.dispatchEvent(new CustomEvent(eventName, { detail: next }));
  };
  return { experience, choose };
}

export function TabletExperienceControls() {
  const { experience, choose } = useTabletExperience();
  return <div className="tablet-experience-controls" role="group" aria-label="Motion and materials">
    <label><input type="checkbox" checked={experience.reducedMotion} onChange={e => choose('reducedMotion', e.target.checked)} />Reduce motion</label>
    <label><input type="checkbox" checked={experience.reducedTransparency} onChange={e => choose('reducedTransparency', e.target.checked)} />Reduce transparency</label>
    <small>Device accessibility preferences are also respected.</small>
  </div>;
}
