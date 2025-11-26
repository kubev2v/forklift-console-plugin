import { type FC, useState } from 'react';
import {
  MigrationSourceType,
  MigrationSourceTypeLabels,
} from 'src/onlineHelp/forkliftHelp/topics/types';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';

type SourceMigrationSelectionProps = {
  selectedSource: MigrationSourceType;
  setSelectedSource: (source: MigrationSourceType) => void;
};

const SourceMigrationSelection: FC<SourceMigrationSelectionProps> = ({
  selectedSource,
  setSelectedSource,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    setIsOpen(false);
    setSelectedSource(value as MigrationSourceType);
  };

  return (
    <div className="pf-v6-u-ml-lg pf-v6-u-mt-md">
      <Dropdown
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
            {MigrationSourceTypeLabels[selectedSource]}
          </MenuToggle>
        )}
        ouiaId="sourceTypeDropdown"
        shouldFocusToggleOnSelect
      >
        <DropdownList>
          <DropdownItem value={MigrationSourceType.VMWARE_VSPHERE}>
            {MigrationSourceTypeLabels[MigrationSourceType.VMWARE_VSPHERE]}
          </DropdownItem>
          <DropdownItem value={MigrationSourceType.OPENSHIFT_VIRTUALIZATION}>
            {MigrationSourceTypeLabels[MigrationSourceType.OPENSHIFT_VIRTUALIZATION]}
          </DropdownItem>
          <DropdownItem value={MigrationSourceType.OPENSTACK}>
            {MigrationSourceTypeLabels[MigrationSourceType.OPENSTACK]}
          </DropdownItem>
          <DropdownItem value={MigrationSourceType.OPEN_VIRTUAL_APPLIANCE}>
            {MigrationSourceTypeLabels[MigrationSourceType.OPEN_VIRTUAL_APPLIANCE]}
          </DropdownItem>
          <DropdownItem value={MigrationSourceType.RED_HAT_VIRTUALIZATION}>
            {MigrationSourceTypeLabels[MigrationSourceType.RED_HAT_VIRTUALIZATION]}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </div>
  );
};

export default SourceMigrationSelection;
