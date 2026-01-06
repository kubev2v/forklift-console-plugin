import { type FC, useContext, useState } from 'react';
import { CreateForkliftContext } from 'src/onlineHelp/learningExperienceDrawer/context/ForkliftContext';
import { PROVIDER_TYPES, type ProviderTypes } from 'src/providers/utils/constants';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';

import { MigrationSourceTypeLabels } from '../utils/constants';

const SourceMigrationSelection: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, setData } = useContext(CreateForkliftContext).learningExperienceContext;

  const onSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    setIsOpen(false);
    setData('migrationSource', value as ProviderTypes);
  };

  return (
    <div className="pf-v6-u-ml-lg pf-v6-u-mt-md">
      <Dropdown
        key={data.migrationSource}
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={(open: boolean) => {
          setIsOpen(open);
        }}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
            isExpanded={isOpen}
          >
            {MigrationSourceTypeLabels[data.migrationSource as ProviderTypes]}
          </MenuToggle>
        )}
        ouiaId="sourceTypeDropdown"
        shouldFocusToggleOnSelect
      >
        <DropdownList>
          <DropdownItem value={PROVIDER_TYPES.vsphere}>
            {MigrationSourceTypeLabels[PROVIDER_TYPES.vsphere]}
          </DropdownItem>
          <DropdownItem value={PROVIDER_TYPES.openshift}>
            {MigrationSourceTypeLabels[PROVIDER_TYPES.openshift]}
          </DropdownItem>
          <DropdownItem value={PROVIDER_TYPES.openstack}>
            {MigrationSourceTypeLabels[PROVIDER_TYPES.openstack]}
          </DropdownItem>
          <DropdownItem value={PROVIDER_TYPES.ova}>
            {MigrationSourceTypeLabels[PROVIDER_TYPES.ova]}
          </DropdownItem>
          <DropdownItem value={PROVIDER_TYPES.ovirt}>
            {MigrationSourceTypeLabels[PROVIDER_TYPES.ovirt]}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </div>
  );
};

export default SourceMigrationSelection;
