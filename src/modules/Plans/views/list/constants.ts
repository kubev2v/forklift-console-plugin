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
  [PlanTableResourceId.Archived]: '$.obj.spec.archived',
  [PlanTableResourceId.Description]: '$.obj.spec.description',
  [PlanTableResourceId.Destination]: '$.obj.spec.provider.destination.name',
  [PlanTableResourceId.MigrationStarted]: '$.obj.status.migration.started',
  [PlanTableResourceId.Name]: '$.obj.metadata.name',
  [PlanTableResourceId.Namespace]: '$.obj.metadata.namespace',
  [PlanTableResourceId.Source]: '$.obj.spec.provider.source.name',
};
