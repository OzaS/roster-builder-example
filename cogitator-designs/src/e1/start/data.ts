import type { DiagKind } from "../../sample";

/**
 * Recent datasets on the start window: invented, neutral names and paths (DEC-001). Each one leads somewhere in the mock:
 * most open with progress; one is missing on disk; one is newer than this build reads; one has modules that don't parse;
 * one sits in a folder the user can't write to.
 */
export type OpenOutcome = "open" | "newer-format" | "parse-errors" | "permission";
export type Recent = {
  id: string;
  title: string;
  /** Folder (or archive) path as the user's system writes it. */
  path: { mac: string; windows: string };
  dklpo: string;
  layers: [on: number, total: number];
  lastOpened: string;
  /** How the dataset is stored: a folder, a dataset archive, or the sample that ships with the app. */
  form: "folder" | "archive" | "sample";
  /** Counts of the last check; the most severe one draws the row's status edge. */
  lastCheck?: { when: string; counts: Partial<Record<DiagKind, number>> };
  missing?: boolean;
  outcome?: OpenOutcome;
  modules: number;
  files: number;
};

export const recents: Recent[] = [
  { id: "demo-skirmish", title: "Demo Skirmish", path: { mac: "~/Datasets/demo-skirmish", windows: "C:\\Users\\you\\Datasets\\demo-skirmish" }, dklpo: "1.0", layers: [3, 4], lastOpened: "Today, 09:41", form: "folder", lastCheck: { when: "today", counts: { error: 1, preservation: 2, suggestion: 4 } }, modules: 5, files: 31 },
  { id: "ember-leagues", title: "Ember Leagues", path: { mac: "~/Datasets/ember-leagues", windows: "C:\\Users\\you\\Datasets\\ember-leagues" }, dklpo: "1.0", layers: [1, 1], lastOpened: "Yesterday, 18:02", form: "folder", lastCheck: { when: "yesterday", counts: { suggestion: 2 } }, modules: 3, files: 12 },
  { id: "tidewater", title: "Tidewater Skirmish", path: { mac: "~/Projects/tidewater/dataset", windows: "D:\\Projects\\tidewater\\dataset" }, dklpo: "1.0", layers: [2, 2], lastOpened: "Mon 17 Nov", form: "folder", lastCheck: { when: "Mon 17 Nov", counts: { error: 3 } }, outcome: "parse-errors", modules: 6, files: 18 },
  { id: "glass-moors", title: "Glass Moors", path: { mac: "/Volumes/Archive/glass-moors", windows: "E:\\Archive\\glass-moors" }, dklpo: "1.0", layers: [1, 2], lastOpened: "Fri 14 Nov", form: "folder", missing: true, modules: 4, files: 22 },
  { id: "copper-vale", title: "Copper Vale", path: { mac: "~/Downloads/copper-vale", windows: "C:\\Users\\you\\Downloads\\copper-vale" }, dklpo: "1.2", layers: [1, 1], lastOpened: "Wed 12 Nov", form: "folder", outcome: "newer-format", modules: 2, files: 9 },
  { id: "lantern-watch", title: "Lantern Watch", path: { mac: "~/Downloads/lantern-watch.zip", windows: "C:\\Users\\you\\Downloads\\lantern-watch.zip" }, dklpo: "1.0", layers: [1, 1], lastOpened: "Tue 11 Nov", form: "archive", lastCheck: { when: "Tue 11 Nov", counts: { preservation: 1 } }, modules: 2, files: 7 },
  { id: "team-demo", title: "Demo Skirmish (team copy)", path: { mac: "/Volumes/Team/datasets/demo-skirmish", windows: "\\\\team-share\\datasets\\demo-skirmish" }, dklpo: "1.0", layers: [3, 4], lastOpened: "3 Nov", form: "folder", lastCheck: { when: "3 Nov", counts: {} }, outcome: "permission", modules: 5, files: 31 },
  { id: "sample", title: "Demo Skirmish", path: { mac: "Inside Field Cogitator", windows: "Inside Field Cogitator" }, dklpo: "1.0", layers: [1, 4], lastOpened: "2 Nov", form: "sample", lastCheck: { when: "2 Nov", counts: { suggestion: 3 } }, modules: 3, files: 14 },
];

/** The folder "Open folder…" picks in the mock: XML data files, no manifest. */
export const xmlFolder = { mac: "~/Downloads/skirmish-xml", windows: "C:\\Users\\you\\Downloads\\skirmish-xml", files: 5 };

export const worstOf = (counts: Partial<Record<DiagKind, number>> = {}): DiagKind | undefined =>
  counts.error ? "error" : counts.preservation ? "preservation" : counts.suggestion ? "suggestion" : undefined;
