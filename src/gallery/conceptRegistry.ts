import { buildConceptGroups, bundledDesignData } from "../design-data/designData";

const groups = buildConceptGroups(bundledDesignData);

export const uxConcepts = groups.activeConcepts;
export const archivedConcepts = groups.archivedConcepts;
export const activeConcepts = groups.allConcepts;
