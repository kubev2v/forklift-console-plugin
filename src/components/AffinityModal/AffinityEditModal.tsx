import { type Dispatch, type SetStateAction, useState } from 'react';

import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { Modal, ModalBody, ModalFooter, ModalHeader, ModalVariant } from '@patternfly/react-core';
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

const AffinityEditModal: OverlayComponent<AffinityEditModalProps> = ({
  closeOverlay,
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
      className="ocs-modal co-catalog-page__overlay"
      data-testid="affinity-edit-modal"
      isOpen
      onClose={closeOverlay}
      position="top"
      variant={ModalVariant.medium}
    >
      <ModalHeader title={title} />
      <ModalBody>
        <AffinityForm
          expressions={expressions}
          fields={fields}
          focusedAffinity={focusedAffinity}
          setFocusedAffinity={setFocusedAffinity}
          setSubmitDisabled={setIsDisabled}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          data-testid="save-affinity-rule-button"
          isDisabled={isDisabled}
          key="confirm"
          onClick={() => {
            onSubmit({
              ...focusedAffinity,
              expressions: expressions?.entities,
              fields: fields?.entities,
            });
          }}
          variant={ButtonVariant.primary}
        >
          {t('Save affinity rule')}
        </Button>
        <Button
          data-testid="cancel-affinity-rule-button"
          key="cancel"
          onClick={onCancel}
          variant={ButtonVariant.link}
        >
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AffinityEditModal;
