import { type FC, type MouseEvent, type Ref, useContext, useState } from 'react';
import { LearningExperienceContext } from 'src/onlineHelp/learningExperienceDrawer/context/LearningExperienceContext';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { PROVIDER_TYPES, type ProviderTypes } from '@utils/providers/constants';

import { MigrationSourceTypeLabels } from '../utils/constants';

const SourceMigrationSelection: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, setData } = useContext(LearningExperienceContext);
  const providerType = (data?.providerType as ProviderTypes) ?? PROVIDER_TYPES.vsphere;

  const onSelect = (_event: MouseEvent | undefined, value: string | number | undefined): void => {
    setIsOpen(false);
    setData('providerType', value);
  };

  return (
    <div className="pf-v6-u-ml-lg pf-v6-u-mt-md">
      <Dropdown
        isOpen={isOpen}
        onOpenChange={(open: boolean) => {
          setIsOpen(open);
        }}
        onSelect={onSelect}
        ouiaId="sourceTypeDropdown"
        selected={providerType}
        shouldFocusToggleOnSelect
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            isExpanded={isOpen}
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
            ref={toggleRef}
          >
            {MigrationSourceTypeLabels[providerType]}
          </MenuToggle>
        )}
      >
        <DropdownList>
          {Object.values(PROVIDER_TYPES).map((type) => (
            <DropdownItem key={type} value={type}>
              {MigrationSourceTypeLabels[type]}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
    </div>
  );
};

export default SourceMigrationSelection;
