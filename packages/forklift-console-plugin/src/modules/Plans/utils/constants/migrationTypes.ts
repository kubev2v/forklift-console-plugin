import { MigrationType } from '../types';

export const migrationTypes: { id: MigrationType; label: MigrationType }[] = [
  { id: MigrationType.Warm, label: MigrationType.Warm },
  { id: MigrationType.Cold, label: MigrationType.Cold },
];
