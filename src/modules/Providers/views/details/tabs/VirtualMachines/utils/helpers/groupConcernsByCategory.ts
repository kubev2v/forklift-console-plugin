import type { Concern } from '@kubev2v/types';

/**
 * Groups concerns by their category.
 *
 * @param {Concern[]} concerns - The list of concerns to group.
 * @returns {Record<string, Concern[]>} The grouped concerns by category.
 */
export const groupConcernsByCategory = (concerns: Concern[] = []): Record<string, Concern[]> => {
  return concerns.reduce(
    (acc, concern) => {
      if (!acc[concern.category]) {
        acc[concern.category] = [];
      }
      acc[concern.category].push(concern);
      return acc;
    },
    {
      Critical: [],
      Information: [],
      Warning: [],
    },
  );
};
