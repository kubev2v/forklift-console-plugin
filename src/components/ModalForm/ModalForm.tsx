import { type ReactNode, useCallback, useState } from 'react';

import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Alert,
  AlertVariant,
  Button,
  type ButtonProps,
  ButtonVariant,
  ModalVariant,
} from '@patternfly/react-core';
import { Modal } from '@patternfly/react-core/deprecated';
import { useForkliftTranslation } from '@utils/i18n';

type ModalFormProps = {
  title: ReactNode;
  children: ReactNode;
  onConfirm: () => Promise<K8sResourceCommon | undefined>;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
  confirmVariant?: ButtonVariant;
  isDisabled?: boolean;
  additionalAction?: ButtonProps;
  testId?: string;
};

const ModalForm: ModalComponent<ModalFormProps> = ({
  additionalAction,
  cancelLabel,
  children,
  className,
  closeModal,
  confirmLabel,
  confirmVariant,
  isDisabled,
  onConfirm,
  testId,
  title,
  variant = ModalVariant.small,
}) => {
  const { t } = useForkliftTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      closeModal();
    } catch (e) {
      setError((e as Error)?.message ?? e?.toString());
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm, closeModal]);

  return (
    <Modal
      variant={variant}
      title={title}
      isOpen
      showClose={false}
      position="top"
      onClose={closeModal}
      data-testid={testId}
      actions={[
        <Button
          key="confirm"
          variant={confirmVariant ?? ButtonVariant.primary}
          onClick={handleConfirm}
          isLoading={isLoading}
          isDisabled={isLoading || Boolean(error) || isDisabled}
          data-testid="modal-confirm-button"
        >
          {confirmLabel ?? t('Save')}
        </Button>,
        ...(additionalAction
          ? [
              <Button key="secondary" {...additionalAction}>
                {additionalAction?.children}
              </Button>,
            ]
          : []),
        <Button
          key="cancel"
          variant={ButtonVariant.secondary}
          onClick={closeModal}
          data-testid="modal-cancel-button"
        >
          {cancelLabel ?? t('Cancel')}
        </Button>,
      ]}
      className={className}
    >
      {children}

      {error && (
        <Alert title={t('Error')} variant={AlertVariant.danger} isInline>
          {t('{{errorMessage}}', { errorMessage: error })}
        </Alert>
      )}
    </Modal>
  );
};

export default ModalForm;
