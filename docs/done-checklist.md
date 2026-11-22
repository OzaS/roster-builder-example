# Done checklist for a design slice

Bring all of this to the review; a missing line is the most common reason for another round.

- [ ] **Track:** new or changed designs are on **Next** as a **Proposal** (`next-track.json` item, or a Next style scoped to `:root[data-look="next"]`). Current is untouched.
- [ ] **Current unchanged:** captures with `?track=current` before and after are byte-identical (screens outside the gallery rail).
- [ ] **Every platform the item lands on** (phone, tablet, desktop; foldable when it applies), **light and dark**.
- [ ] **States:** empty, loading, error, unavailable, read-only, long names, large text, the narrowest width.
- [ ] **Principles:** no card as the default container; rows distinct; actions declared (verb, target, availability, feedback); readable type sizes.
- [ ] **Elements view:** an entry for each new primitive, control, row or panel, and the design data's element sections kept in line.
- [ ] **Design data:** screens and workflows in the gallery's design JSON; never delete screens (archive them).
- [ ] **Sample data** synthetic and neutral.
- [ ] **Review page or side-by-side captures** (Current beside Next) for anything the user has not seen yet.
- [ ] **Type check and build** pass (`npm run build` at the root).
