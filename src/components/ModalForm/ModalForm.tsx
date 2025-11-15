import { type ReactNode, useCallback, useState } from 'react';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Alert,
  AlertVariant,
  Button,
  type ButtonProps,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

type ModalFormProps = {
  title: ReactNode;
  children: ReactNode;
  onConfirm: () => Promise<unknown>;
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
      isOpen
      position="top"
      onClose={closeModal}
      data-testid={testId}
      className={className}
    >
      <ModalHeader title={title} />
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{children}</StackItem>
          {error && (
            <StackItem>
              <Alert title={t('Error')} variant={AlertVariant.danger} isInline>
                {t('{{errorMessage}}', { errorMessage: error })}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant={confirmVariant ?? ButtonVariant.primary}
          onClick={handleConfirm}
          isLoading={isLoading}
          isDisabled={isLoading || Boolean(error) || isDisabled}
          data-testid="modal-confirm-button"
        >
          {confirmLabel ?? t('Save')}
        </Button>
        {additionalAction && (
          <Button key="secondary" {...additionalAction}>
            {additionalAction?.children}
          </Button>
        )}
        <Button
          key="cancel"
          variant={ButtonVariant.secondary}
          onClick={closeModal}
          data-testid="modal-cancel-button"
        >
          {cancelLabel ?? t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalForm;
