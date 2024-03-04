import { PlanPhase } from '../types';

export const getPhaseLabel = (phase: PlanPhase) => phaseLabels?.[phase] ?? 'Unknown';

const phaseLabels: Record<PlanPhase, string> = {
  // t('Ready')
  Ready: 'Ready',
  // t('Not Ready')
  NotReady: 'Not Ready',
  // t('Running')
  Running: 'Running',
  // t('Succeeded')
  Succeeded: 'Succeeded',
  // t('Canceled')
  Canceled: 'Canceled',
  // t('Failed')
  Failed: 'Failed',
  // t('Archived')
  Archived: 'Archived',
  // t('Archiving')
  Archiving: 'Archiving',
  // t('Error')
  Error: 'Error',
  // t('Warning')
  Warning: 'Warning',
  // t('VM Failed')
  vmError: 'VM Failed',
  // t('Unknown')
  Unknown: 'Unknown',
};
