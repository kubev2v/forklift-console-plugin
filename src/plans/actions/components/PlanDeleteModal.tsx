import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ItemIsOwnedAlert } from 'src/components/modals/ItemIsOwnedAlert';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/planStatusResolver';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { PlanModel } from '@forklift-ui/types';
import { getGroupVersionKindForModel, k8sDelete } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, ButtonVariant, Stack, StackItem } from '@patternfly/react-core';
import { getName, getNamespace, getOwnerReference } from '@utils/crds/common/selectors';
import { getResourceUrl } from '@utils/getResourceUrl';

import type { PlanModalProps } from './types';

const PlanDeleteModal: OverlayComponent<PlanModalProps> = ({ closeOverlay, plan }) => {
  const { t } = useForkliftTranslation();
  const navigate = useNavigate();

  const name = getName(plan);
  const namespace = getNamespace(plan);
  const owner = getOwnerReference(plan);

  const onDelete = useCallback(async () => {
    const deleted = k8sDelete({ model: PlanModel, resource: plan });
    navigate(
      getResourceUrl({ groupVersionKind: getGroupVersionKindForModel(PlanModel), namespace }),
    )?.catch(() => undefined);

    return deleted;
  }, [namespace, navigate, plan]);

  const status = getPlanStatus(plan);

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Delete')}
      confirmVariant={ButtonVariant.danger}
      onConfirm={onDelete}
      title={t('Delete plan')}
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
          {(status === PlanStatuses.Executing || status === PlanStatuses.Pending) && (
            <Alert
              className="forklift-delete-modal__alert"
              title={t('Plan is currently running')}
              variant="danger"
            />
          )}
        </StackItem>
        <StackItem>
          {status !== PlanStatuses.Archived && (
            <Alert
              className="forklift-delete-modal__alert"
              title={t('Plan is not archived')}
              variant="info"
            >
              <ForkliftTrans>
                Deleting a migration plan does not remove temporary resources, it is recommended to{' '}
                <strong>archive</strong> the plan first before deleting it, to remove temporary
                resources.
              </ForkliftTrans>
            </Alert>
          )}
        </StackItem>
        <StackItem>{owner && <ItemIsOwnedAlert namespace={namespace} owner={owner} />}</StackItem>
      </Stack>
    </ModalForm>
  );
};

export default PlanDeleteModal;
