import React from 'react';
import withQueryClient from 'common/src/components/QueryClientHoc';
import { Field } from 'common/src/components/types';
import { useModal } from 'common/src/polyfills/console-dynamic-plugin-sdk';
import { AddEditMappingModal } from 'legacy/src/Mappings/components/AddEditMappingModal';
import { MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';

import { Button } from '@patternfly/react-core';

export const AddMappingButton: React.FC<{
  namespace: string;
  label: string;
  mappingType: MappingType;
}> = ({ namespace, label, mappingType }) => {
  const launchModal = useModal();

  return (
    <Button
      variant="primary"
      onClick={() =>
        launchModal(withQueryClient(AddMappingModal), {
          currentNamespace: namespace,
          label,
          mappingType,
        })
      }
    >
      {label}
    </Button>
  );
};
AddMappingButton.displayName = 'AddMappingButton';

const AddMappingModal: React.FC<{
  currentNamespace: string;
  closeModal: () => void;
  label: string;
  mappingType: MappingType;
}> = ({ closeModal, currentNamespace, label, mappingType }) => {
  return (
    <AddEditMappingModal
      onClose={closeModal}
      mappingBeingEdited={null}
      namespace={currentNamespace}
      isFixed
      title={label}
      mappingType={mappingType}
      setActiveMapType={() => undefined}
    />
  );
};
AddMappingModal.displayName = 'AddMappingModal';

const byName = {
  isVisible: true,
  filter: {
    type: 'freetext',
    toPlaceholderLabel: (t) => t('Filter by name'),
  },
  sortable: true,
};

export const commonFieldsMetadata: Field[] = [
  {
    id: C.NAME,
    toLabel: (t) => t('Name'),
    ...byName,
    isIdentity: true,
  },
  {
    id: C.NAMESPACE,
    toLabel: (t) => t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      toPlaceholderLabel: (t) => t('Filter by namespace'),
      type: 'freetext',
    },
    sortable: true,
  },
  {
    id: C.SOURCE,
    toLabel: (t) => t('Source provider'),
    ...byName,
  },
  {
    id: C.TARGET,
    toLabel: (t) => t('Target provider'),
    ...byName,
  },

  {
    id: C.FROM,
    toLabel: (t) => t('From'),
    isVisible: true,
    sortable: false,
  },
];
