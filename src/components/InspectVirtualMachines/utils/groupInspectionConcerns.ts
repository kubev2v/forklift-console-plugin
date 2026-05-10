import type { InspectionConcern } from '@utils/crds/conversion/types';

export const ORDERED_INSPECTION_CONCERN_CATEGORIES = [
  'Critical',
  'Error',
  'Warning',
  'Advisory',
  'Information',
] as const;

export const groupInspectionConcernsByCategory = (
  concerns: InspectionConcern[],
): Map<string, InspectionConcern[]> => {
  const grouped = new Map<string, InspectionConcern[]>();

  for (const concern of concerns) {
    const existing = grouped.get(concern.category) ?? [];
    existing.push(concern);
    grouped.set(concern.category, existing);
  }

  return grouped;
};
