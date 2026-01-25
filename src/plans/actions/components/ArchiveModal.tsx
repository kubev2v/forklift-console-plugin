import { useCallback } from 'react';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { PlanModel } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { getName } from '@utils/crds/common/selectors';
import { getPlanArchived } from '@utils/crds/plans/selectors';

import type { PlanModalProps } from './types';

const ArchiveModal: ModalComponent<PlanModalProps> = ({ plan, ...rest }) => {
  const { t } = useForkliftTranslation();

  const onArchive = useCallback(async () => {
    const op = getPlanArchived(plan) ? 'replace' : 'add';

    return k8sPatch({
      data: [{ op, path: '/spec/archived', value: true }],
      model: PlanModel,
      resource: plan,
    });
  }, [plan]);

  const status = getPlanStatus(plan);
  const isPlanRunning = status === PlanStatuses.Executing;

  return (
    <ModalForm
      confirmLabel={t('Archive')}
      confirmVariant={isPlanRunning ? ButtonVariant.danger : ButtonVariant.primary}
      title={t('Archive migration plan')}
      onConfirm={onArchive}
      {...rest}
    >
      <ForkliftTrans>
        <Stack hasGutter>
          <StackItem>
            Archive plan <strong className="co-break-word">{getName(plan)}</strong>?
          </StackItem>
          <StackItem>
            When a plan is archived, its history, metadata, and logs are deleted. The plan cannot be
            edited or restarted but it can be viewed.
          </StackItem>
        </Stack>
      </ForkliftTrans>
    </ModalForm>
  );
};

export default ArchiveModal;
