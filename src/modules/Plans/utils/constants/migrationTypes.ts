import { MigrationType } from '../types/MigrationType';

export const migrationTypes: { id: MigrationType; label: MigrationType }[] = [
  { id: MigrationType.Warm, label: MigrationType.Warm },
  { id: MigrationType.Cold, label: MigrationType.Cold },
];
