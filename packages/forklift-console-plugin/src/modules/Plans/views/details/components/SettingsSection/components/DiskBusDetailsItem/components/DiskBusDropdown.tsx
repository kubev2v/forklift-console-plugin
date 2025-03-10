import React, { FC, Ref, useRef, useState } from 'react';
import { ModalInputComponentType } from 'src/modules/Providers/modals';

import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import { DiskBusType } from '../../../utils/types';
import { diskBusDropdownItems, diskBusTypeLabels } from '../utils/constants';

type DropdownRendererProps = {
  value: string;
  onChange: (string: string) => void;
};

const DiskBusDropdownFactory: () => ModalInputComponentType = () => {
  const DropdownRenderer: FC<DropdownRendererProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const onToggleClick = () => {
      setIsOpen((open) => !open);
    };

    const onSelect = () => {
      setIsOpen(false);
    };

    return (
      <Select
        isOpen={isOpen}
        ref={menuRef}
        onSelect={onSelect}
        onOpenChange={(open: boolean) => setIsOpen(open)}
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            variant="default"
            ref={toggleRef}
            onClick={onToggleClick}
            isExpanded={isOpen}
            isFullWidth
          >
            {diskBusTypeLabels[value] ?? diskBusTypeLabels[DiskBusType.VIRTIO]}
          </MenuToggle>
        )}
        selected={value ?? DiskBusType.VIRTIO}
        isScrollable
      >
        <SelectList>
          {diskBusDropdownItems.map((diskBusType) => (
            <SelectOption
              key={diskBusType}
              onClick={() => onChange(diskBusType)}
              value={diskBusType}
            >
              {diskBusTypeLabels[diskBusType]}
            </SelectOption>
          ))}
        </SelectList>
      </Select>
    );
  };

  return DropdownRenderer;
};

export default DiskBusDropdownFactory;
