import React from 'react';
import withQueryClient from 'common/src/components/QueryClientHoc';
import { DefaultHeader, TableViewHeaderProps } from 'common/src/components/TableView';
import { ResourceFieldFactory, ResourceFieldPartialFactory } from 'common/src/components/types';
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

const byName: ResourceFieldPartialFactory = (t) => ({
  isVisible: true,
  filter: {
    type: 'freetext',
    placeholderLabel: t('Filter by name'),
  },
  sortable: true,
});

export const commonFieldsMetadataFactory: ResourceFieldFactory = (t) => [
  {
    resourceFieldId: C.NAME,
    label: t('Name'),
    ...byName(t),
    isIdentity: true,
  },
  {
    resourceFieldId: C.NAMESPACE,
    label: t('Namespace'),
    isVisible: true,
    isIdentity: true,
    filter: {
      placeholderLabel: t('Filter by namespace'),
      type: 'freetext',
    },
    sortable: true,
  },
  {
    resourceFieldId: C.SOURCE,
    label: t('Source provider'),
    ...byName(t),
  },
  {
    resourceFieldId: C.TARGET,
    label: t('Target provider'),
    ...byName(t),
  },
  {
    resourceFieldId: C.FROM,
    label: t('From'),
    isVisible: true,
    sortable: false,
  },
  {
    resourceFieldId: C.MANAGED,
    label: t('Managed'),
    isHidden: true,
    filter: {
      type: 'slider',
      standalone: true,
      placeholderLabel: t('Show managed'),
      defaultValues: ['false'],
    },
  },
];

export const StartWithEmptyColumnMapper = (props: TableViewHeaderProps) => (
  <>
    <Th />
    <DefaultHeader {...props} />
  </>
);
