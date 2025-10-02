import type { AffinityRowData } from './types';

export const getAvailableAffinityID = (affinities: AffinityRowData[]) => {
  const idSet = new Set(affinities.map((aff) => aff.id));
  let id = 1;
  while (idSet.has(id.toString())) {
    id += 1;
  }
  return id.toString();
};
