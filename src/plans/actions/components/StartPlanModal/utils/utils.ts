import { MigrationModel, type V1beta1Migration, type V1beta1Plan } from '@kubev2v/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';

export const startPlanMigration = async (plan: V1beta1Plan) => {
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

  return k8sCreate({ data: migration, model: MigrationModel });
};
