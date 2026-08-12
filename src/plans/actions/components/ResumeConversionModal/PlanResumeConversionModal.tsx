import { useCallback } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { MigrationModel, type V1beta1Plan } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { getPlanVirtualMachinesMigrationStatus } from '@utils/crds/plans/selectors';
import { getObjectRef } from '@utils/helpers/getObjectRef';

export type PlanResumeConversionModalProps = {
  plan: V1beta1Plan;
};

const PlanResumeConversionModal: OverlayComponent<PlanResumeConversionModalProps> = ({
  closeOverlay,
  plan,
  ...rest
}) => {
  const { t } = useForkliftTranslation();
  const { name, namespace, uid } = getObjectRef(plan);

  // TODO: Remove cast once `disksCopied` is added to @forklift-ui/types (upstream CRD type gap).
  const resumableVMs = getPlanVirtualMachinesMigrationStatus(plan).filter(
    (vm) => (vm as { disksCopied?: boolean }).disksCopied === true,
  );

  const onConfirm = useCallback(async () => {
    const migration = {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'Migration',
      metadata: {
        generateName: `${name}-resume-`,
        namespace,
        ownerReferences: [
          { apiVersion: plan.apiVersion, kind: plan.kind, name: name ?? '', uid: uid ?? '' },
        ],
      },
      spec: {
        plan: { name, namespace, uid },
        // TODO: Remove cast once `resumeConversion` is added to @forklift-ui/types.
        resumeConversion: true,
      },
    };
    await k8sCreate({ data: migration, model: MigrationModel });
  }, [plan, name, namespace, uid]);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Resume')}
      onConfirm={onConfirm}
      title={t('Resume conversion')}
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          {t(
            'Resume conversion for plan {{name}}? {{count}} VM with copied disks will be processed.',
            { count: resumableVMs.length, name },
          )}
        </StackItem>
        <StackItem>
          <Alert
            isInline
            isPlain
            title={t('Disk copy will be skipped')}
            variant={AlertVariant.info}
          >
            <Content component={ContentVariants.p}>
              {t(
                'This will re-run only the guest conversion step, reusing the disks that were already copied. The source VM must not have been powered on since the original migration.',
              )}
            </Content>
          </Alert>
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default PlanResumeConversionModal;
