export enum PlanPhase {
  // T('Error')
  Error = 'Error',
  // T('Some VMs Failed')
  vmError = 'Some VMs Failed',
  // T('Unknown')
  Unknown = 'Unknown',
  // T('Archiving')
  Archiving = 'Archiving',
  // T('Archived')
  Archived = 'Archived',
  // T('Failed')
  Failed = 'Failed',
  // T('Canceled')
  Canceled = 'Canceled',
  // T('Succeeded')
  Succeeded = 'Succeeded',
  // T('Running')
  Running = 'Running',
  // T('Ready')
  Ready = 'Ready',
  // T('Warning')
  Warning = 'Warning',
  // T('Not Ready')
  NotReady = 'Not Ready',
}
