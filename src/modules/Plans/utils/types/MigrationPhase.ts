export type MigrationPhase =
  | 'Error'
  | 'vmError'
  | 'Unknown'
  | 'Archived'
  | 'Failed'
  | 'Canceled'
  | 'Succeeded'
  | 'Running'
  | 'Ready'
  | 'NotReady';
