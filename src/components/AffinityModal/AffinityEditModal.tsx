import { type Dispatch, type FC, type SetStateAction, useState } from 'react';
import { useModal } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
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

const AffinityEditModal: FC<AffinityEditModalProps> = ({
  focusedAffinity,
  onCancel,
  onSubmit,
  setFocusedAffinity,
  title,
}) => {
  const { t } = useForkliftTranslation();

  const { toggleModal } = useModal();

  const [isDisabled, setIsDisabled] = useState(false);
  const expressions = useIDEntities<AffinityLabel>(focusedAffinity?.expressions ?? []);
  const fields = useIDEntities<AffinityLabel>(focusedAffinity?.fields ?? []);

  return (
    <Modal
      data-testid="affinity-edit-modal"
      actions={[
        <Button
          key="confirm"
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
        </Button>,
        <Button
          key="cancel"
          data-testid="cancel-affinity-rule-button"
          onClick={onCancel}
          variant={ButtonVariant.link}
        >
          {t('Cancel')}
        </Button>,
      ]}
      className="ocs-modal co-catalog-page__overlay"
      isOpen
      onClose={toggleModal}
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
