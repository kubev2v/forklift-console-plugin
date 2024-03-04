export type PlanPhase =
  | 'Error'
  | 'vmError'
  | 'Unknown'
  | 'Archiving'
  | 'Archived'
  | 'Failed'
  | 'Canceled'
  | 'Succeeded'
  | 'Running'
  | 'Ready'
  | 'Warning'
  | 'NotReady';
