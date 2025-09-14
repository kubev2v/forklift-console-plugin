import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';
import { getPlanMigrationType } from 'src/plans/details/utils/utils';

import { MigrationModel, type V1beta1Migration, type V1beta1Plan } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { TELEMETRY_EVENTS } from '@utils/analytics/constants';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { t } from '@utils/i18n';

export const startPlanMigration = async (
  plan: V1beta1Plan,
  trackEvent?: (event: string, data: Record<string, unknown>) => void,
  sourceProviderType?: string,
) => {
  const name = getName(plan);
  const namespace = getNamespace(plan);
  const uid = getUID(plan);
  const migration: V1beta1Migration = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Migration',
    metadata: {
      generateName: `${name}-`,
      namespace,
      ownerReferences: [
        {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Plan',
          name: name!,
          uid: uid!,
        },
      ],
    },
    spec: {
      plan: {
        name,
        namespace,
        uid,
      },
    },
  };

  trackEvent?.(TELEMETRY_EVENTS.MIGRATION_STARTED, {
    migrationType: getPlanMigrationType(plan),
    planName: name,
    planNamespace: namespace,
    providerType: sourceProviderType,
    vmCount: plan?.spec?.vms?.length ?? 0,
  });

  return k8sCreate({ data: migration, model: MigrationModel });
};

export const migrationModalMessage = (migrationType: MigrationTypeValue): string => {
  switch (migrationType) {
    case MigrationTypeValue.Warm:
      return t('VMs included in warm migrations migrate with minimal downtime.');
    case MigrationTypeValue.Live:
      return t('VMs included in live migrations migrate without downtime.');
    case MigrationTypeValue.Cold:
    default:
      return t('VMs included in cold migrations are shut down during migration.');
  }
};
