export enum PlanTableResourceId {
  Name = 'name',
  Namespace = 'namespace',
  MigrationStarted = 'migration-started',
  Destination = 'destination',
  Source = 'source',
  Phase = 'phase',
  MigrationType = 'migration-type',
  Vms = 'vms',
  Description = 'description',
  Actions = 'actions',
  Archived = 'archived',
}

export const planResourceApiJsonPaths: Partial<Record<PlanTableResourceId, string>> = {
  [PlanTableResourceId.Archived]: '$.spec.archived',
  [PlanTableResourceId.Description]: '$.spec.description',
  [PlanTableResourceId.Destination]: '$.spec.provider.destination.name',
  [PlanTableResourceId.MigrationStarted]: '$.status.migration.started',
  [PlanTableResourceId.Name]: '$.metadata.name',
  [PlanTableResourceId.Namespace]: '$.metadata.namespace',
  [PlanTableResourceId.Source]: '$.spec.provider.source.name',
};
