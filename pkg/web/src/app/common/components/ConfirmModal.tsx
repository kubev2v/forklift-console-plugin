import * as React from 'react';
import { Modal, Stack, Flex, Button, ModalProps, ButtonProps } from '@patternfly/react-core';
import { QuerySpinnerMode, ResolvedQuery } from './ResolvedQuery';
import { UnknownMutationResult } from '../types';

// TODO lib-ui candidate

export interface IConfirmModalProps {
  variant?: ModalProps['variant'];
  isOpen: boolean;
  toggleOpen: () => void;
  mutateFn: () => void;
  mutateResult?: UnknownMutationResult;
  title: string;
  body: React.ReactNode;
  confirmButtonText: string;
  cancelButtonText?: string;
  confirmButtonDisabled?: boolean;
  confirmButtonVariant?: ButtonProps['variant'];
  errorText?: string;
  position?: ModalProps['position'];
  titleIconVariant?: ModalProps['titleIconVariant'];
}

export const ConfirmModal: React.FunctionComponent<IConfirmModalProps> = ({
  variant = 'small',
  isOpen,
  toggleOpen,
  mutateFn,
  mutateResult,
  title,
  body,
  confirmButtonText,
  confirmButtonDisabled = false,
  confirmButtonVariant = 'primary',
  cancelButtonText = 'Cancel',
  errorText = 'Error performing action',
  position,
  titleIconVariant = undefined,
}: IConfirmModalProps) =>
  isOpen ? (
    <Modal
      variant={variant}
      title={title}
      titleIconVariant={titleIconVariant}
      isOpen
      onClose={toggleOpen}
      position={position}
      footer={
        <Stack hasGutter>
          {mutateResult ? (
            <ResolvedQuery
              result={mutateResult}
              errorTitle={errorText}
              spinnerMode={QuerySpinnerMode.Inline}
            />
          ) : null}
          <Flex spaceItems={{ default: 'spaceItemsSm' }}>
            <Button
              id="modal-confirm-button"
              key="confirm"
              variant={confirmButtonVariant}
              onClick={mutateFn}
              isDisabled={mutateResult?.isLoading || confirmButtonDisabled}
            >
              {confirmButtonText}
            </Button>
            <Button
              id="modal-cancel-button"
              key="cancel"
              variant="link"
              onClick={toggleOpen}
              isDisabled={mutateResult?.isLoading}
            >
              {cancelButtonText}
            </Button>
          </Flex>
        </Stack>
      }
    >
      {body}
    </Modal>
  ) : null;
