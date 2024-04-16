import { PlanPhase } from '../types';

// Creating a record to map each phase to itself
export const planPhases: Record<string, PlanPhase> = {
  Error: 'Error',
  vmError: 'vmError',
  Unknown: 'Unknown',
  Archiving: 'Archiving',
  Archived: 'Archived',
  Failed: 'Failed',
  Canceled: 'Canceled',
  Succeeded: 'Succeeded',
  Running: 'Running',
  Ready: 'Ready',
  Warning: 'Warning',
  NotReady: 'NotReady',
};
