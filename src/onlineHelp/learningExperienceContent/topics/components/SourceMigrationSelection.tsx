import { type FC, type Ref, useContext, useState } from 'react';
import { LearningExperienceContext } from 'src/onlineHelp/learningExperienceDrawer/context/LearningExperienceContext';
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
  const { data, setData } = useContext(LearningExperienceContext);
  const providerType = (data?.providerType as ProviderTypes) ?? PROVIDER_TYPES.vsphere;

  const onSelect = (_event: React.MouseEvent | undefined, value: string | number | undefined) => {
    setIsOpen(false);
    setData('providerType', value as ProviderTypes);
  };

  return (
    <div className="pf-v6-u-ml-lg pf-v6-u-mt-md">
      <Dropdown
        isOpen={isOpen}
        onSelect={onSelect}
        onOpenChange={(open: boolean) => {
          setIsOpen(open);
        }}
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => {
              setIsOpen((prev) => !prev);
            }}
            isExpanded={isOpen}
          >
            {MigrationSourceTypeLabels[providerType]}
          </MenuToggle>
        )}
        ouiaId="sourceTypeDropdown"
        shouldFocusToggleOnSelect
        selected={providerType}
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
