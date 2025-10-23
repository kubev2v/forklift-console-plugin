import { type Dispatch, type SetStateAction, useState } from 'react';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ActionGroup, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useIDEntities } from './hooks/useIDEntities';
import type { AffinityLabel, AffinityRowData } from './utils/types';
import AffinityForm from './AffinityForm';

type AffinityEditModalProps = {
  focusedAffinity: AffinityRowData;
  onCancel: () => void;
  onSubmit: (affinity: AffinityRowData) => void;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
  title: string;
};

const AffinityEditModal: ModalComponent<AffinityEditModalProps> = ({
  closeModal,
  focusedAffinity,
  onCancel,
  onSubmit,
  setFocusedAffinity,
  title,
}) => {
  const { t } = useForkliftTranslation();
  const [isDisabled, setIsDisabled] = useState(false);
  const expressions = useIDEntities<AffinityLabel>(focusedAffinity?.expressions ?? []);
  const fields = useIDEntities<AffinityLabel>(focusedAffinity?.fields ?? []);

  return (
    <Modal
      data-testid="affinity-edit-modal"
      footer={
        <ActionGroup>
          <Button
            data-testid="save-affinity-rule-button"
            onClick={() => {
              onSubmit({
                ...focusedAffinity,
                expressions: expressions?.entities,
                fields: fields?.entities,
              });
            }}
            isDisabled={isDisabled}
            variant={ButtonVariant.primary}
          >
            {t('Save affinity rule')}
          </Button>
          <Button
            data-testid="cancel-affinity-rule-button"
            onClick={onCancel}
            size="sm"
            variant={ButtonVariant.link}
          >
            {t('Cancel')}
          </Button>
        </ActionGroup>
      }
      className="ocs-modal co-catalog-page__overlay"
      isOpen
      onClose={closeModal}
      position="top"
      title={title}
      variant={ModalVariant.medium}
    >
      <AffinityForm
        expressions={expressions}
        fields={fields}
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={setFocusedAffinity}
        setSubmitDisabled={setIsDisabled}
      />
    </Modal>
  );
};

export default AffinityEditModal;
