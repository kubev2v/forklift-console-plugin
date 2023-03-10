import React from 'react';
import withQueryClient from 'common/src/components/QueryClientHoc';
import { DefaultHeader, TableViewHeaderProps } from 'common/src/components/TableView';
import { ResourceField } from 'common/src/components/types';
import { useModal } from 'common/src/polyfills/console-dynamic-plugin-sdk';
import { AddEditMappingModal } from 'legacy/src/Mappings/components/AddEditMappingModal';
import { MappingType } from 'legacy/src/queries/types';
import * as C from 'src/utils/constants';

import { Button } from '@patternfly/react-core';
import { Th } from '@patternfly/react-table';

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
    toPlaceholderLabel: 'Filter by name',
  },
  sortable: true,
};

export const commonFieldsMetadata: ResourceField[] = [
  {
    resourceFieldID: C.NAME,
    label: 'Name',
    ...byName,
    isIdentity: true,
  },
  {
    resourceFieldID: C.NAMESPACE,
    label: 'Namespace',
    isVisible: true,
    isIdentity: true,
    filter: {
      toPlaceholderLabel: 'Filter by namespace',
      type: 'freetext',
    },
    sortable: true,
  },
  {
    resourceFieldID: C.SOURCE,
    label: 'Source provider',
    ...byName,
  },
  {
    resourceFieldID: C.TARGET,
    label: 'Target provider',
    ...byName,
  },

  {
    resourceFieldID: C.FROM,
    label: 'From',
    isVisible: true,
    sortable: false,
  },
];

export const StartWithEmptyColumnMapper = (props: TableViewHeaderProps) => (
  <>
    <Th />
    <DefaultHeader {...props} />
  </>
);
