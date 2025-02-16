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
  { id: PlanPhase.Error, label: PlanPhase.Error },
  { id: PlanPhase.vmError, label: PlanPhase.vmError },
  { id: PlanPhase.Unknown, label: PlanPhase.Unknown },
  { id: PlanPhase.Archived, label: PlanPhase.Archived },
  { id: PlanPhase.Failed, label: PlanPhase.Failed },
  { id: PlanPhase.Canceled, label: PlanPhase.Canceled },
  { id: PlanPhase.Succeeded, label: PlanPhase.Succeeded },
  { id: PlanPhase.Running, label: PlanPhase.Running },
  { id: PlanPhase.Ready, label: PlanPhase.Ready },
  { id: PlanPhase.Warning, label: PlanPhase.Warning },
  { id: PlanPhase.NotReady, label: PlanPhase.NotReady },
];
