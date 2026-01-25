import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';
import { ItemIsOwnedAlert } from 'src/components/modals/ItemIsOwnedAlert';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { PlanModel } from '@forklift-ui/types';
import { getGroupVersionKindForModel, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { getName, getNamespace, getOwnerReference } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';

import type { PlanModalProps } from './types';

const PlanDeleteModal: ModalComponent<PlanModalProps> = ({ plan, ...rest }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();

  const name = getName(plan);
  const namespace = getNamespace(plan);
  const owner = getOwnerReference(plan);

  const onDelete = useCallback(async () => {
    const deleted = k8sDelete({ model: PlanModel, resource: plan });
    navigate(
      getResourceUrl({ groupVersionKind: getGroupVersionKindForModel(PlanModel), namespace }),
    );

    return deleted;
  }, [namespace, navigate, plan]);

  const status = getPlanStatus(plan);

  return (
    <ModalForm
      confirmVariant={ButtonVariant.danger}
      confirmLabel={t('Delete')}
      onConfirm={onDelete}
      title={t('Delete plan')}
      {...rest}
    >
      <Stack hasGutter>
        <StackItem>
          <ForkliftTrans>
            Are you sure you want to delete <strong className="co-break-word">{name}</strong> in
            {namespace && (
              <>
                {' '}
                project <strong>{namespace}</strong>
              </>
            )}
            ?
          </ForkliftTrans>
        </StackItem>
        <StackItem>
          {status === PlanStatuses.Executing && (
            <Alert
              variant="danger"
              title={t('Plan is currently running')}
              className="forklift-delete-modal__alert"
            />
          )}
        </StackItem>
        <StackItem>
          {status !== PlanStatuses.Archived && (
            <Alert
              variant="info"
              title={t('Plan is not archived')}
              className="forklift-delete-modal__alert"
            >
              <ForkliftTrans>
                Deleting a migration plan does not remove temporary resources, it is recommended to{' '}
                <strong>archive</strong> the plan first before deleting it, to remove temporary
                resources.
              </ForkliftTrans>
            </Alert>
          )}
        </StackItem>
        <StackItem>
          <ItemIsOwnedAlert owner={owner!} namespace={namespace} />
        </StackItem>
      </Stack>
    </ModalForm>
  );
};

export default PlanDeleteModal;
