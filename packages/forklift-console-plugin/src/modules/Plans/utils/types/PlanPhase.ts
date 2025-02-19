export enum PlanPhase {
  // t('Error')
  Error = 'Error',
  // t('Some VMs Failed')
  vmError = 'Some VMs Failed',
  // t('Unknown')
  Unknown = 'Unknown',
  // t('Archiving')
  Archiving = 'Archiving',
  // t('Archived')
  Archived = 'Archived',
  // t('Failed')
  Failed = 'Failed',
  // t('Canceled')
  Canceled = 'Canceled',
  // t('Succeeded')
  Succeeded = 'Succeeded',
  // t('Running')
  Running = 'Running',
  // t('Ready')
  Ready = 'Ready',
  // t('Warning')
  Warning = 'Warning',
  // t('Not Ready')
  NotReady = 'Not Ready',
  // t('Waiting for cutover')
  Waiting = 'Waiting for cutover',
}
