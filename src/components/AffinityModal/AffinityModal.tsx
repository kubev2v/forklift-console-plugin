import { useState } from 'react';

import ModalForm from '@components/ModalForm/ModalForm';
import type { K8sIoApiCoreV1Affinity, K8sResourceCommon } from '@kubev2v/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ModalVariant } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { affinityToRowsData } from './utils/affinityToRowsData';
import { defaultNewAffinity } from './utils/constants';
import { getAvailableAffinityID } from './utils/getAvailableAffinityID';
import { rowsDataToAffinity } from './utils/rowsDataToAffinity';
import type { AffinityRowData } from './utils/types';
import AffinityEditModal from './AffinityEditModal';
import AffinityEmptyState from './AffinityEmptyState';
import AffinityList from './AffinityList';

export type AffinityModalProps = {
  title?: string;
  onConfirm: (updatedAffinity: K8sIoApiCoreV1Affinity) => Promise<K8sResourceCommon>;
  initialAffinity: K8sIoApiCoreV1Affinity | undefined;
};

const AffinityModal: ModalComponent<AffinityModalProps> = ({
  initialAffinity,
  onConfirm,
  title,
  ...rest
}) => {
  const { t } = useForkliftTranslation();

  const [affinities, setAffinities] = useState<AffinityRowData[]>(
    affinityToRowsData(initialAffinity ?? {}),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [focusedAffinity, setFocusedAffinity] = useState<AffinityRowData>(defaultNewAffinity);

  const onAffinityClickAdd = () => {
    setIsEditing(true);
    setIsCreating(true);
    setFocusedAffinity({ ...defaultNewAffinity, id: getAvailableAffinityID(affinities) });
  };

  const onAffinityAdd = (affinity: AffinityRowData) => {
    setAffinities((prevAffinities) => [...(prevAffinities || []), affinity]);
    setIsEditing(false);
    setIsCreating(false);
  };

  const onAffinityChange = (updatedAffinity: AffinityRowData) => {
    setAffinities((prevAffinities) =>
      prevAffinities.map((affinity) => {
        if (affinity.id === updatedAffinity.id) return { ...affinity, ...updatedAffinity };
        return affinity;
      }),
    );
    setIsEditing(false);
  };
  const onSaveAffinity = isCreating ? onAffinityAdd : onAffinityChange;

  const onAffinityDelete = (affinity: AffinityRowData) => {
    setAffinities((prevAffinities) => prevAffinities.filter(({ id }) => id !== affinity.id));
  };

  const onAffinityClickEdit = (affinity: AffinityRowData) => {
    setFocusedAffinity(affinity);
    setIsEditing(true);
  };

  const onCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  const list = isEmpty(affinities) ? (
    <AffinityEmptyState onAffinityClickAdd={onAffinityClickAdd} />
  ) : (
    <AffinityList
      affinities={affinities}
      onAffinityClickAdd={onAffinityClickAdd}
      onDelete={onAffinityDelete}
      onEdit={onAffinityClickEdit}
    />
  );

  return isEditing ? (
    <AffinityEditModal
      focusedAffinity={focusedAffinity}
      onCancel={onCancel}
      onSubmit={onSaveAffinity}
      setFocusedAffinity={setFocusedAffinity}
      title={isCreating ? t('Add affinity rule') : t('Edit affinity rule')}
      {...rest}
    />
  ) : (
    <ModalForm
      testId="affinity-modal"
      title={title ?? t('Affinity rules')}
      onConfirm={async () => onConfirm(rowsDataToAffinity(affinities) ?? {}) ?? {}}
      confirmLabel={t('Apply rules')}
      variant={ModalVariant.medium}
      {...rest}
    >
      {list}
    </ModalForm>
  );
};

export default AffinityModal;
