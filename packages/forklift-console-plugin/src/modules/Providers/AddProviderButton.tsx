import React from 'react';
import { useTranslation } from 'src/utils/i18n';

import { withQueryClient } from '@kubev2v/common/components/QueryClientHoc';
import { useModal } from '@kubev2v/common/polyfills/sdk-shim';
import { AddEditProviderModal } from '@kubev2v/legacy/Providers/components/AddEditProviderModal';
import { Button } from '@patternfly/react-core';

const AddProviderModal: React.FC<{
  currentNamespace: string;
  closeModal: () => void;
}> = ({ closeModal, currentNamespace }) => {
  return (
    <AddEditProviderModal
      onClose={closeModal}
      providerBeingEdited={null}
      namespace={currentNamespace}
    />
  );
};

export const AddProviderButton: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { t } = useTranslation();
  const launchModal = useModal();

  return (
    <Button
      data-testid="add-provider-button"
      variant="primary"
      onClick={() =>
        launchModal(withQueryClient(AddProviderModal), { currentNamespace: namespace })
      }
    >
      {t('Create Provider')}
    </Button>
  );
};
AddProviderButton.displayName = 'AddProviderButton';
