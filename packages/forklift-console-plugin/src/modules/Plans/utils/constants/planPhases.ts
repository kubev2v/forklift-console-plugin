import { PlanPhase } from '../types';

/**
 * Represents a list of potential phases that a plan can be in, formatted for use in a dropdown menu.
 * Each item in the array is an object containing:
 * - `id`: A `PlanPhase` type indicating the specific state of the plan.
 * - `label`: A string that provides a user-friendly name for the phase, suitable for display in the UI.
 *
 * This array is intended to be used for creating filter dropdowns, where users can select a plan phase to filter the results shown.
 */
export const planPhases: { id: PlanPhase; label: string }[] = [
  { id: 'Error', label: 'Error' },
  { id: 'vmError', label: 'VM Error' },
  { id: 'Unknown', label: 'Unknown' },
  { id: 'Archiving', label: 'Archiving' },
  { id: 'Archived', label: 'Archived' },
  { id: 'Failed', label: 'Failed' },
  { id: 'Canceled', label: 'Canceled' },
  { id: 'Succeeded', label: 'Succeeded' },
  { id: 'Running', label: 'Running' },
  { id: 'Ready', label: 'Ready' },
  { id: 'Warning', label: 'Warning' },
  { id: 'NotReady', label: 'Not Ready' },
];
