import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/planStatusResolver';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import { ItemIsOwnedAlert } from '@components/modals/ItemIsOwnedAlert';
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

  // Interpolated values are written as object children (`{{ name }}`) so the key react-i18next
  // builds keeps the `{{name}}` placeholder rather than inlining the plan's actual name.
  const confirmationMessage = namespace ? (
    <ForkliftTrans values={{ name, namespace }}>
      Are you sure you want to delete <strong className="co-break-word">{{ name }}</strong> in
      project <strong className="co-break-word">{{ namespace }}</strong>?
    </ForkliftTrans>
  ) : (
    <ForkliftTrans values={{ name }}>
      Are you sure you want to delete <strong className="co-break-word">{{ name }}</strong>?
    </ForkliftTrans>
  );

  return (
    <ModalForm
      closeOverlay={closeOverlay}
      confirmLabel={t('Delete')}
      confirmVariant={ButtonVariant.danger}
      onConfirm={onDelete}
      title={t('Delete plan')}
    >
      <Stack hasGutter>
        <StackItem>{confirmationMessage}</StackItem>
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
