# Agent Notes

## Design Source Of Truth
- Inspect `src/design-data/roster-builder.design.json` before changing gallery workflows, screen grouping, screen labels, archived designs, trash, or element coverage.
- React components and icon mappings remain in code; the JSON stores editable design metadata and workflow structure.
- Workflow deletion must move screens to the `unsorted` workflow, never delete them.

## Trash
- Removed screens live in each design's `trash.screens`.
- Do not inspect, modify, or account for trash screens unless the user explicitly asks to review trash.

## Elements
- When adding new UI primitives, controls, rows, cards, panels, or workflow/gallery chrome, add a representative entry to the Elements view.
- Keep `design.elements.sections` in `src/design-data/roster-builder.design.json` aligned with `DesignElementsPanel`.

## Comments
- Screen review comments live in `design.comments` inside `src/design-data/roster-builder.design.json`.
- Review comments when the user asks about screen feedback, comment state, Glance view, or design review notes.
