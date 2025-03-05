import React, { FC, useState } from 'react';
import { ModalInputComponentType } from 'src/modules/Providers/modals';

// import { useForkliftTranslation } from 'src/utils/i18n';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';

import { DiskBusType } from '../../../utils/types';

type DropdownRendererProps = {
  value: string;
  onChange: (string: string) => void;
};

const DiskBusDropdownFactory: () => ModalInputComponentType = () => {
  //   const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const onSelect = () => {
    setIsOpen(false);
  };

  const DropdownRenderer: FC<DropdownRendererProps> = ({ value, onChange }) => (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={(open: boolean) => setIsOpen(open)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
          {value}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <DropdownItem onClick={() => onChange(DiskBusType.VIRTIO)} value={DiskBusType.VIRTIO}>
          {DiskBusType.VIRTIO}
        </DropdownItem>
        <DropdownItem onClick={() => onChange(DiskBusType.SATA)} value={DiskBusType.SATA}>
          {DiskBusType.SATA}
        </DropdownItem>
        <DropdownItem onClick={() => onChange(DiskBusType.SCSI)} value={DiskBusType.SCSI}>
          {DiskBusType.SCSI}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );

  return DropdownRenderer;
};

export default DiskBusDropdownFactory;
