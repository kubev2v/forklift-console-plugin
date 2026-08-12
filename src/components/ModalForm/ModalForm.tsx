import { type ReactNode, useCallback, useState } from 'react';

import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import {
  Alert,
  AlertVariant,
  Button,
  type ButtonProps,
  ButtonVariant,
  Flex,
  FlexItem,
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
  additionalAction?: ButtonProps;
  cancelLabel?: string;
  children: ReactNode;
  className?: string;
  confirmLabel?: string;
  confirmVariant?: ButtonVariant;
  description?: ReactNode;
  headerHelp?: ReactNode;
  isDisabled?: boolean;
  label?: ReactNode;
  onConfirm: () => Promise<unknown>;
  testId?: string;
  title: ReactNode;
  variant?: ModalVariant;
};

const ModalForm: ModalComponent<ModalFormProps> = ({
  additionalAction,
  cancelLabel,
  children,
  className,
  closeModal,
  confirmLabel,
  confirmVariant,
  description,
  headerHelp,
  isDisabled,
  label,
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
    } catch (err) {
      setError((err as Error)?.message ?? err?.toString());
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm, closeModal]);

  const headerTitle = label ? (
    <Flex alignItems={{ default: 'alignItemsBaseline' }} gap={{ default: 'gapXs' }}>
      <FlexItem>
        <ModalHeader description={description} help={headerHelp} title={title} />
      </FlexItem>
      <FlexItem>{label}</FlexItem>
    </Flex>
  ) : (
    <ModalHeader description={description} help={headerHelp} title={title} />
  );

  return (
    <Modal
      className={className}
      data-testid={testId}
      isOpen
      onClose={closeModal}
      position="top"
      variant={variant}
    >
      {headerTitle}
      <ModalBody>
        <Stack hasGutter>
          <StackItem>{children}</StackItem>
          {error && (
            <StackItem>
              <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
                {t('{{errorMessage}}', { errorMessage: error })}
              </Alert>
            </StackItem>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button
          data-testid="modal-confirm-button"
          isDisabled={isLoading || isDisabled}
          isLoading={isLoading}
          key="confirm"
          onClick={handleConfirm}
          variant={confirmVariant ?? ButtonVariant.primary}
        >
          {confirmLabel ?? t('Save')}
        </Button>
        {additionalAction && (
          <Button key="secondary" {...additionalAction}>
            {additionalAction?.children}
          </Button>
        )}
        <Button
          data-testid="modal-cancel-button"
          key="cancel"
          onClick={closeModal}
          variant={ButtonVariant.secondary}
        >
          {cancelLabel ?? t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalForm;
